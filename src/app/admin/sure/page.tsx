import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import { Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowUp,
  ChevronRight,
  Mic,
  Paperclip,
  PlusCircle,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { EROUTES } from '@/utils/enums'
import { extractErrorMessage } from '@/utils/helpers'
import { ShowToast } from '@/utils/utils'
import { SureComparisonDownload } from './sure-comparison-download'
import { SureMarkdownText } from './sure-markdown'
import { SurePremiumCarousel } from './sure-premium-carousel'
import { SureProcessLinks } from './sure-process-links'
import {
  EMPTY_ASSISTANT,
  mapApiMessages,
  upsertMessages,
  type SureChatMessage,
  type SureChatRole,
  type SureComparisonPdfPayload,
  type SurePremiumOffersPayload,
} from './sure-message-sync'

/** One short line above the carousel — never the old Rate-ID / product dump. */
function shortPremiumIntro(
  text: string | undefined,
  offers: SurePremiumOffersPayload
): string {
  const code = offers.quote_code?.trim()
  const page = offers.pagination?.page ?? 1
  const hasMore = offers.pagination?.has_more === true
  const insurer = offers.filter?.insurer?.trim()
  const base = insurer
    ? code
      ? `Here are ${insurer} premium offers for ${code} (page ${page}).`
      : `Here are ${insurer} premium offers (page ${page}).`
    : code
      ? `Here are premium offers for ${code} (page ${page}).`
      : `Here are premium offers (page ${page}).`
  const more = hasMore
    ? ' Scroll the cards for this page, or ask for the next page.'
    : ' Scroll the cards to compare.'
  // Prefer our caption over Gemini’s long list (even if text already looks short).
  const trimmed = text?.trim() ?? ''
  if (
    trimmed &&
    trimmed.length < 180 &&
    !/rate\s*id/i.test(trimmed) &&
    !/\n\s*[-*]|\n\s*\d+\./.test(trimmed)
  ) {
    return trimmed
  }
  return base + more
}

type ChatRole = SureChatRole

type ChatAttachment = {
  id: string
  name: string
}

type ChatMessage = SureChatMessage

type SureConversation = {
  id: string
  title: string
  updatedAt: string
}

type SureApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

type SureNewChatData = {
  chat: string
  title?: string | null
}

type SureMessageData = {
  chat: string
  title?: string | null
  message_id: string
  response: {
    id: string
    text?: string
    offers?: SurePremiumOffersPayload | null
    comparison_pdf?: SureComparisonPdfPayload | null
  }
}

type SureChatListItem = {
  chat: string
  title?: string | null
  updated_at?: string | null
}

type SureChatShowData = {
  chat: string
  title?: string | null
  updated_at?: string | null
  messages: Array<{
    id: string
    role: ChatRole
    text: string
    attachments?: string[] | null
    offers?: SurePremiumOffersPayload | null
    comparison_pdf?: SureComparisonPdfPayload | null
    feedback?: 'up' | 'down' | null
  }>
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function sureChatPath(chatCode: string): string {
  // Public chat ULIDs are always lowercase in the URL
  return EROUTES.SURE_CHAT.replace(':sessionCode', chatCode.toLowerCase())
}

/** Normalize chat ULID from URL/API so comparisons and requests stay lowercase. */
function normalizeChatCode(chatCode: string): string {
  return chatCode.toLowerCase()
}

function conversationTitle(title: string | null | undefined): string {
  const trimmed = (title ?? '').trim()
  return trimmed || 'New chat'
}

/** Logo with a Paramount-style moon arc (~30s per lap). */
function SureLogo({ className }: { className?: string }) {
  return (
    <div className={cn('sure-logo-wrap', className)} aria-hidden>
      <span className="sure-logo-shine" />
      <div className="logo-container">
        <img src="/logo/logo3.png" alt="" className="sure-logo-img" />
      </div>
    </div>
  )
}

function SureComposer({
  draft,
  setDraft,
  attachments,
  onPickFiles,
  onRemoveAttachment,
  onSend,
  fileInputRef,
  fileInputId,
  centered,
  disabled,
}: {
  draft: string
  setDraft: (value: string) => void
  attachments: ChatAttachment[]
  onPickFiles: (files: FileList | null) => void
  onRemoveAttachment: (id: string) => void
  onSend: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  fileInputId: string
  centered?: boolean
  disabled?: boolean
}) {
  const hasText = draft.trim().length > 0
  const hasAttachments = attachments.length > 0
  // Mic only when completely empty; send when typing or files attached
  const showSend = hasText || hasAttachments

  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border bg-card p-3 shadow-sm',
        centered ? 'max-w-2xl' : 'max-w-3xl'
      )}
    >
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <span
              key={file.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground"
            >
              <Paperclip className="size-3 shrink-0 opacity-70" />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveAttachment(file.id)}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends; Shift+Enter keeps a newline
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (showSend && !disabled) {
              onSend()
            }
          }
        }}
        rows={centered ? 2 : 3}
        placeholder="Ask about Insurance"
        disabled={disabled}
        className="w-full resize-none bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-60"
      />

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            multiple
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              onPickFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <label
            htmlFor={fileInputId}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground',
              disabled && 'pointer-events-none opacity-60'
            )}
          >
            <Paperclip className="size-4" />
            Attach
          </label>
        </div>

        {showSend ? (
          <button
            type="button"
            onClick={onSend}
            disabled={disabled}
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#C20C0C] text-white transition hover:bg-[#a40a0a] disabled:opacity-60"
            aria-label="Send message"
          >
            <ArrowUp className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
            aria-label="Voice input"
            // UI only for now — no recording
            onClick={() => undefined}
            disabled={disabled}
          >
            <Mic className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function SureConversationsSidebar({
  open,
  onOpenChange,
  search,
  onSearchChange,
  conversations,
  activeChatId,
  loading,
  onNewChat,
  onSelectChat,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  onSearchChange: (value: string) => void
  conversations: SureConversation[]
  activeChatId: string | null
  loading: boolean
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) {
      return conversations
    }
    return conversations.filter((c) => c.title.toLowerCase().includes(q))
  }, [conversations, search])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(100%,20rem)] gap-0 p-0 sm:max-w-xs">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle>Sure</SheetTitle>
          <SheetDescription>Your chats and search</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <PlusCircle className="size-4 text-[#C20C0C]" />
            New Chat
          </button>

          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search in chat"
              className="w-full rounded-xl border border-border bg-background py-2.5 pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#C20C0C]/40 focus:ring-1 focus:ring-[#C20C0C]/30"
            />
          </label>

          <div className="my-1 border-t border-border" />

          <div>
            <p className="mb-2 px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Conversations
            </p>

            {loading ? (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                Loading chats…
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {filtered.map((chat) => {
                  const active = chat.id === activeChatId
                  return (
                    <li key={chat.id}>
                      <button
                        type="button"
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                          'w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition',
                          active
                            ? 'bg-[#C20C0C]/10 font-medium text-[#C20C0C]'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        {chat.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function SurePage() {
  const navigate = useNavigate()
  // Nested under /dashboard/sure — also matches /dashboard/sure/chat/:sessionCode
  const { sessionCode: paramCode } = useParams<{ sessionCode?: string }>()
  const chatMatch = useMatch(EROUTES.SURE_CHAT)
  // Lowercase so URL casing never breaks active-chat match or API lookup
  const sessionCodeRaw = chatMatch?.params.sessionCode ?? paramCode
  const sessionCode = sessionCodeRaw ? normalizeChatCode(sessionCodeRaw) : undefined
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [isReplying, setIsReplying] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  const [conversations, setConversations] = useState<SureConversation[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()
  const bottomRef = useRef<HTMLDivElement>(null)
  // Keep the active ULID even while React Router catches up after navigate()
  const chatCodeRef = useRef<string | null>(sessionCode ?? null)
  // Skip one URL-driven load when we navigated after creating a chat locally
  const skipNextLoadRef = useRef(false)
  // Stays true from first-send create until send finishes (survives Strict Mode)
  const suppressLoadChatRef = useRef(false)
  // Ignore stale loadChat responses that finish after a newer load/send
  const loadSeqRef = useRef(0)
  // Sidebar/chat switch: next successful GET replaces local thread
  const replaceOnNextLoadRef = useRef(false)

  const hasMessages = messages.length > 0
  const busy = isReplying || isStartingChat || isLoadingChat

  useEffect(() => {
    chatCodeRef.current = sessionCode ?? null
  }, [sessionCode])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isReplying])

  const refreshConversations = useCallback(async () => {
    setConversationsLoading(true)
    try {
      const response = await apiClient.get<
        SureApiEnvelope<{ chats: SureChatListItem[] }>
      >('vrm/sureai/chats')
      const rows = response.data?.data?.chats ?? []
      setConversations(
        rows.map((row) => ({
          id: normalizeChatCode(row.chat),
          title: conversationTitle(row.title),
          updatedAt: row.updated_at ?? '',
        }))
      )
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Could not load chats.')
    } finally {
      setConversationsLoading(false)
    }
  }, [])

  // Load sidebar list whenever the sheet opens
  useEffect(() => {
    if (sidebarOpen) {
      void refreshConversations()
    }
  }, [sidebarOpen, refreshConversations])

  const loadChat = useCallback(async (chatCode: string) => {
    // First-send path owns local messages until POST /message finishes
    if (suppressLoadChatRef.current) {
      return
    }

    const normalizedCode = normalizeChatCode(chatCode)
    const seq = ++loadSeqRef.current
    const forceReplace = replaceOnNextLoadRef.current
    replaceOnNextLoadRef.current = false
    setIsLoadingChat(true)
    try {
      const response = await apiClient.get<SureApiEnvelope<SureChatShowData>>(
        `vrm/sureai/chat/${normalizedCode}`
      )

      // Drop this result if a newer load started, or send still owns the thread
      if (seq !== loadSeqRef.current || suppressLoadChatRef.current) {
        return
      }

      const payload = response.data?.data
      if (!payload?.chat) {
        throw new Error(response.data?.message || 'Chat not found.')
      }

      const mapped = mapApiMessages(payload.messages ?? [])

      // Cold load / chat switch → replace; otherwise merge by id (keep POST reply)
      setMessages((prev) => {
        if (forceReplace || prev.length === 0) {
          return mapped
        }
        return upsertMessages(prev, mapped)
      })
    } catch (error) {
      if (seq !== loadSeqRef.current || suppressLoadChatRef.current) {
        return
      }
      ShowToast.error(extractErrorMessage(error) || 'Could not open this chat.')
      if (forceReplace) {
        setMessages([])
      }
    } finally {
      if (seq === loadSeqRef.current) {
        setIsLoadingChat(false)
      }
    }
  }, [])

  // When the URL chat code changes (reload or sidebar switch), load messages
  useEffect(() => {
    if (!sessionCode) {
      return
    }

    // Local create/send already has the thread — don't fetch over it
    if (suppressLoadChatRef.current || skipNextLoadRef.current) {
      skipNextLoadRef.current = false
      return
    }

    void loadChat(sessionCode)
  }, [sessionCode, loadChat])

  function pickFiles(files: FileList | null) {
    if (!files?.length) {
      return
    }

    const next = Array.from(files).map((file) => ({
      id: makeId(),
      name: file.name,
    }))
    setAttachments((prev) => [...prev, ...next])
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
  }

  // POST /vrm/sureai/new → save ULID session, then put it in the URL
  async function createChatSession(): Promise<string> {
    const response = await apiClient.post<SureApiEnvelope<SureNewChatData>>(
      'vrm/sureai/new'
    )
    const chat = response.data?.data?.chat
    if (!chat) {
      throw new Error(response.data?.message || 'Could not start a Sure chat.')
    }
    return normalizeChatCode(chat)
  }

  async function startNewChat() {
    if (busy) {
      return
    }

    setIsStartingChat(true)
    setSidebarOpen(false)

    try {
      const chat = await createChatSession()
      chatCodeRef.current = chat
      // Empty new chat — skip one navigate load; allow later sidebar/reload loads
      skipNextLoadRef.current = true
      suppressLoadChatRef.current = false
      replaceOnNextLoadRef.current = false
      loadSeqRef.current += 1
      setMessages([])
      setDraft('')
      setAttachments([])
      setIsReplying(false)
      navigate(sureChatPath(chat))
      void refreshConversations()
    } catch (error) {
      ShowToast.error(extractErrorMessage(error) || 'Could not start a new chat.')
    } finally {
      setIsStartingChat(false)
    }
  }

  async function selectChat(chatId: string) {
    const normalizedId = normalizeChatCode(chatId)
    if (normalizedId === (chatCodeRef.current ?? sessionCode)) {
      setSidebarOpen(false)
      return
    }

    // Switching chats must replace local thread from the API
    suppressLoadChatRef.current = false
    skipNextLoadRef.current = false
    replaceOnNextLoadRef.current = true
    loadSeqRef.current += 1
    chatCodeRef.current = normalizedId
    setMessages([])
    setSidebarOpen(false)
    setDraft('')
    setAttachments([])
    navigate(sureChatPath(normalizedId))
  }

  async function ensureChatCode(): Promise<string> {
    const existing = chatCodeRef.current ?? sessionCode ?? null
    if (existing) {
      return normalizeChatCode(existing)
    }

    // First send from /dashboard/sure creates the session, then updates the URL
    const chat = await createChatSession()
    chatCodeRef.current = chat
    skipNextLoadRef.current = true
    // Hold off GET /chat until this send paints the API reply
    suppressLoadChatRef.current = true
    loadSeqRef.current += 1
    navigate(sureChatPath(chat), { replace: true })
    return chat
  }

  async function sendMessage() {
    const text = draft.trim()
    if ((!text && attachments.length === 0) || busy) {
      return
    }

    const attachmentNames = attachments.map((file) => file.name)
    const userBody = text || '(Attachment only)'
    // Temp id so the user bubble shows while Gemini is still working
    const tempUserId = `temp-${makeId()}`

    setIsReplying(true)
    // Block URL-driven loads for the whole turn (new or existing chat)
    suppressLoadChatRef.current = true
    loadSeqRef.current += 1

    setMessages((prev) =>
      upsertMessages(prev, [
        {
          id: tempUserId,
          role: 'user',
          text: userBody,
          attachments: attachmentNames.length ? attachmentNames : undefined,
        },
      ])
    )
    setDraft('')
    setAttachments([])

    try {
      const chat = await ensureChatCode()

      // POST chat + message + attachment names; backend persists + returns UUID ids
      const response = await apiClient.post<SureApiEnvelope<SureMessageData>>(
        'vrm/sureai/message',
        {
          chat,
          message: text,
          attachments: attachmentNames,
        }
      )

      const payload = response.data?.data
      if (!payload?.message_id || !payload.response?.id) {
        throw new Error(response.data?.message || 'Sure did not return message ids.')
      }

      const userMessage: ChatMessage = {
        id: payload.message_id,
        role: 'user',
        text: userBody,
        attachments: attachmentNames.length ? attachmentNames : undefined,
      }

      const assistantMessage: ChatMessage = {
        id: payload.response.id,
        role: 'assistant',
        // POST response is the source of truth for this turn
        text: payload.response.text?.trim() || EMPTY_ASSISTANT,
        feedback: null,
        offers: payload.response.offers ?? null,
        comparisonPdf: payload.response.comparison_pdf ?? null,
        processLinks: payload.response.process_links ?? null,
      }

      // Drop temp bubble, upsert server user + assistant by id
      setMessages((prev) =>
        upsertMessages(
          prev.filter((message) => message.id !== tempUserId),
          [userMessage, assistantMessage]
        )
      )
      void refreshConversations()

      // Soft reconcile from DB (merge-only) after paint
      suppressLoadChatRef.current = false
      void loadChat(chat)
    } catch (error) {
      // Remove optimistic bubble and restore composer so the user can retry
      setMessages((prev) => prev.filter((message) => message.id !== tempUserId))
      setDraft(text)
      setAttachments(
        attachmentNames.map((name) => ({
          id: makeId(),
          name,
        }))
      )
      ShowToast.error(extractErrorMessage(error) || 'Could not send your message.')
      suppressLoadChatRef.current = false
    } finally {
      setIsReplying(false)
    }
  }

  async function setMessageFeedback(messageId: string, value: 'up' | 'down') {
    const target = messages.find(
      (message) => message.id === messageId && message.role === 'assistant'
    )
    if (!target) {
      return
    }

    // Same thumb again clears the reaction (null)
    const next = target.feedback === value ? null : value
    const chatRaw = chatCodeRef.current ?? sessionCode
    if (!chatRaw) {
      return
    }
    const chat = normalizeChatCode(chatRaw)

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || message.role !== 'assistant') {
          return message
        }
        return { ...message, feedback: next }
      })
    )

    try {
      // POST reaction against the assistant message UUID from /message
      await apiClient.post('vrm/sureai/reaction', {
        chat,
        message_id: messageId,
        reaction: next,
      })
    } catch (error) {
      // Roll local UI back if the API rejects the reaction
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId || message.role !== 'assistant') {
            return message
          }
          return { ...message, feedback: target.feedback ?? null }
        })
      )
      ShowToast.error(extractErrorMessage(error) || 'Could not save your reaction.')
    }
  }

  return (
    <div className="sure-chat relative flex min-h-[calc(100svh-5rem)] flex-col">
      {/* Nested route outlet (chat/:sessionCode) — keeps one page instance */}
      <Outlet />

      {/* Pull control — opens previous chats sidebar */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute top-1/2 left-0 z-20 flex h-14 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
        aria-label="Open conversations"
        title="Previous chats"
      >
        <ChevronRight className="size-4" />
      </button>

      <SureConversationsSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        search={chatSearch}
        onSearchChange={setChatSearch}
        conversations={conversations}
        activeChatId={sessionCode ?? chatCodeRef.current}
        loading={conversationsLoading}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
      />

      {!hasMessages ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-2 py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <SureLogo className="size-20 md:size-24" />
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                Sure by Acensure
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoadingChat
                  ? 'Loading chat…'
                  : 'Ask anything about policies, covers, or quotes — beta.'}
              </p>
              {/* First-send has no thread yet — show progress under the hero */}
              {isReplying ? (
                <p className="mt-3 text-sm text-muted-foreground">Thinking…</p>
              ) : null}
            </div>
          </div>

          <SureComposer
            draft={draft}
            setDraft={setDraft}
            attachments={attachments}
            onPickFiles={pickFiles}
            onRemoveAttachment={removeAttachment}
            onSend={sendMessage}
            fileInputRef={fileInputRef}
            fileInputId={fileInputId}
            centered
            disabled={busy}
          />
        </div>
      ) : (
        <>
          <div className="relative z-10 border-b border-border px-2 py-3 pl-8">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <SureLogo className="size-9 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Sure by Acensure</p>
                <p className="text-xs text-muted-foreground">beta</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto px-2 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-[#C20C0C] px-3.5 py-2.5 text-sm leading-relaxed text-white">
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      {message.attachments?.length ? (
                        <ul className="mt-2 space-y-1 border-t border-white/20 pt-2 text-xs opacity-90">
                          {message.attachments.map((name) => (
                            <li key={name} className="flex items-center gap-1.5">
                              <Paperclip className="size-3 shrink-0" />
                              <span className="truncate">{name}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex max-w-[95%] flex-col gap-2">
                    {/* When offer cards exist, skip Gemini’s long Rate-ID / product list */}
                    {message.offers?.offers?.length ? (
                      <>
                        {message.comparisonPdf ? (
                          <SureMarkdownText text={message.text} />
                        ) : (
                          <p className="text-sm leading-relaxed text-foreground">
                            {shortPremiumIntro(message.text, message.offers)}
                          </p>
                        )}
                        {/* PDF comparison first, then rate cards */}
                        {message.comparisonPdf ? (
                          <SureComparisonDownload payload={message.comparisonPdf} />
                        ) : null}
                        <SurePremiumCarousel payload={message.offers} />
                      </>
                    ) : (
                      <>
                        <SureMarkdownText text={message.text} />
                        {message.comparisonPdf ? (
                          <SureComparisonDownload payload={message.comparisonPdf} />
                        ) : null}
                      </>
                    )}
                    {message.processLinks?.length ? (
                      <SureProcessLinks links={message.processLinks} />
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMessageFeedback(message.id, 'up')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition',
                          message.feedback === 'up'
                            ? 'border-[#C20C0C] bg-[#C20C0C]/10 text-[#C20C0C]'
                            : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        aria-pressed={message.feedback === 'up'}
                      >
                        <ThumbsUp className="size-3.5" />
                        I liked response
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageFeedback(message.id, 'down')}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition',
                          message.feedback === 'down'
                            ? 'border-[#C20C0C] bg-[#C20C0C]/10 text-[#C20C0C]'
                            : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        aria-pressed={message.feedback === 'down'}
                      >
                        <ThumbsDown className="size-3.5" />
                        Need Improvement
                      </button>
                    </div>
                  </div>
                )
              )}

              {isReplying && (
                <p className="text-sm text-muted-foreground">Thinking…</p>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="relative z-10 border-t border-border px-2 py-4">
            <div className="mx-auto flex justify-center">
              <SureComposer
                draft={draft}
                setDraft={setDraft}
                attachments={attachments}
                onPickFiles={pickFiles}
                onRemoveAttachment={removeAttachment}
                onSend={sendMessage}
                fileInputRef={fileInputRef}
                fileInputId={`${fileInputId}-active`}
                disabled={busy}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

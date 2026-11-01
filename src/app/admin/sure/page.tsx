import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import {
  ArrowUp,
  ChevronRight,
  Mic,
  Paperclip,
  PlusCircle,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type ChatRole = 'user' | 'assistant'

type ChatAttachment = {
  id: string
  name: string
}

type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  attachments?: string[]
}

/** Shape ready for a future conversations API */
type SureConversation = {
  id: string
  title: string
  updatedAt: string
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildEcho(text: string, attachmentNames: string[]): string {
  const quoted = text.trim()
  const parts: string[] = []

  if (quoted) {
    parts.push(`Sure: I received “${quoted}”.`)
  } else {
    parts.push('Sure: I received your message.')
  }

  if (attachmentNames.length === 1) {
    parts.push(`Attached file: ${attachmentNames[0]}.`)
  } else if (attachmentNames.length > 1) {
    parts.push(`Attached files: ${attachmentNames.join(', ')}.`)
  }

  parts.push('This is a beta stub reply — real insurance answers will land here soon.')
  return parts.join(' ')
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
            if (showSend) {
              onSend()
            }
          }
        }}
        rows={centered ? 2 : 3}
        placeholder="Ask about Insurance"
        className="w-full resize-none bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />

      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              onPickFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <label
            htmlFor={fileInputId}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Paperclip className="size-4" />
            Attach
          </label>
        </div>

        {showSend ? (
          <button
            type="button"
            onClick={onSend}
            className="inline-flex size-9 items-center justify-center rounded-full bg-[#C20C0C] text-white transition hover:bg-[#a40a0a]"
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
  onNewChat,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  onSearchChange: (value: string) => void
  conversations: SureConversation[]
  onNewChat: () => void
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

            {filtered.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {filtered.map((chat) => (
                  <li key={chat.id}>
                    <button
                      type="button"
                      className="w-full truncate rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-muted"
                    >
                      {chat.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function SurePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [isReplying, setIsReplying] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatSearch, setChatSearch] = useState('')
  // Placeholder until a backend exists
  const [conversations] = useState<SureConversation[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()
  const bottomRef = useRef<HTMLDivElement>(null)
  const echoTimerRef = useRef<number | null>(null)

  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isReplying])

  useEffect(() => {
    return () => {
      if (echoTimerRef.current !== null) {
        window.clearTimeout(echoTimerRef.current)
      }
    }
  }, [])

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

  function startNewChat() {
    if (echoTimerRef.current !== null) {
      window.clearTimeout(echoTimerRef.current)
      echoTimerRef.current = null
    }
    setMessages([])
    setDraft('')
    setAttachments([])
    setIsReplying(false)
    setSidebarOpen(false)
  }

  function sendMessage() {
    const text = draft.trim()
    if ((!text && attachments.length === 0) || isReplying) {
      return
    }

    const attachmentNames = attachments.map((file) => file.name)
    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      text: text || '(Attachment only)',
      attachments: attachmentNames.length ? attachmentNames : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setDraft('')
    setAttachments([])
    setIsReplying(true)

    if (echoTimerRef.current !== null) {
      window.clearTimeout(echoTimerRef.current)
    }

    echoTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: 'assistant',
          text: buildEcho(text, attachmentNames),
        },
      ])
      setIsReplying(false)
      echoTimerRef.current = null
    }, 600)
  }

  return (
    <div className="sure-chat relative flex min-h-[calc(100svh-5rem)] flex-col">
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
        onNewChat={startNewChat}
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
                Ask anything about policies, covers, or quotes — beta.
              </p>
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
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'bg-[#C20C0C] text-white'
                        : 'border border-border bg-muted text-foreground'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {message.attachments?.length ? (
                      <ul className="mt-2 space-y-1 border-t border-white/20 pt-2 text-xs opacity-90 dark:border-white/15">
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
              ))}

              {isReplying && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-border bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                    Sure is thinking…
                  </div>
                </div>
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
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

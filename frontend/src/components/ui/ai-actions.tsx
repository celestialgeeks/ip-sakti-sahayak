"use client";

import Image from "next/image";
import {
  CopyIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { Action, Actions } from "@/components/ui/actions";
import {
  Conversation,
  ConversationContent,
} from "@/components/ui/conversation";
import { Message, MessageContent } from "@/components/ui/message";

/**
 * Reference turn model for the action row.
 *
 * The sample is rendered from the product's own vocabulary — a Section 3(p)
 * prior-art exchange — because a demo that speaks in "Hello, how are you" cannot
 * show whether an action row survives a real answer's height. Avatars point at
 * `public/` marks rather than a remote CDN: `next/image` refuses an unlisted
 * remote host, and a showcase that only renders behind a config change is not a
 * showcase.
 */
const messages: {
  id: string;
  from: "user" | "assistant";
  content: string;
  avatar: string;
  name: string;
}[] = [
  {
    id: "1",
    from: "user",
    content:
      "Verify patent novelty for a Haridra (Curcuma longa) formulation under TKDL guidelines.",
    avatar: "/icon.png",
    name: "Patent Analyst",
  },
  {
    id: "2",
    from: "assistant",
    content:
      "The preparation matches TKDL accession ME/00/0057/02, so novelty is barred under Section 3(p) of the Patents Act, 1970.",
    avatar: "/logo.png",
    name: "IP-SAKTI Sahayak",
  },
];

const actions = [
  {
    icon: RefreshCcwIcon,
    label: "Retry",
  },
  {
    icon: ThumbsUpIcon,
    label: "Like",
  },
  {
    icon: ThumbsDownIcon,
    label: "Dislike",
  },
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: ShareIcon,
    label: "Share",
  },
];

const Example = () => {
  return (
    <div className="flex h-full w-full max-w-lg items-center justify-center">
      <Conversation className="relative w-full">
        <ConversationContent>
          {messages.map((message) => (
            <Message
              className={`flex flex-col gap-2 ${
                message.from === "assistant" ? "items-start" : "items-end"
              }`}
              from={message.from}
              key={message.id}
            >
              <Image
                src={message.avatar}
                alt={message.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <MessageContent>{message.content}</MessageContent>
              {message.from === "assistant" && (
                <Actions className="mt-2">
                  {actions.map((action) => (
                    <Action key={action.label} label={action.label}>
                      <action.icon className="size-4" />
                    </Action>
                  ))}
                </Actions>
              )}
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
    </div>
  );
};

export { Example };

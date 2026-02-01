import { anthropic } from "@ai-sdk/anthropic";
import {
  LanguageModelV1,
  LanguageModelV1StreamPart,
  LanguageModelV1Message,
} from "@ai-sdk/provider";

const MODEL = "claude-haiku-4-5";

export class MockLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1" as const;
  readonly provider = "mock";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "tool" as const;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractUserPrompt(messages: LanguageModelV1Message[]): string {
    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "user") {
        const content = message.content;
        if (Array.isArray(content)) {
          // Extract text from content parts
          const textParts = content
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text);
          return textParts.join(" ");
        } else if (typeof content === "string") {
          return content;
        }
      }
    }
    return "";
  }

  private getLastToolResult(messages: LanguageModelV1Message[]): any {
    // Find the last tool message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "tool") {
        const content = messages[i].content;
        if (Array.isArray(content) && content.length > 0) {
          return content[0];
        }
      }
    }
    return null;
  }

  private async *generateMockStream(
    messages: LanguageModelV1Message[],
    userPrompt: string
  ): AsyncGenerator<LanguageModelV1StreamPart> {
    // Count tool messages to determine which step we're on
    const toolMessageCount = messages.filter((m) => m.role === "tool").length;

    // Determine component type from the original user prompt
    const promptLower = userPrompt.toLowerCase();
    let componentType = "counter";
    let componentName = "Counter";

    if (promptLower.includes("form")) {
      componentType = "form";
      componentName = "ContactForm";
    } else if (promptLower.includes("card")) {
      componentType = "card";
      componentName = "Card";
    }

    // Step 1: Create component file
    if (toolMessageCount === 1) {
      const text = `I'll create a ${componentName} component for you.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(25);
      }

      yield {
        type: "tool-call",
        toolCallType: "function",
        toolCallId: `call_1`,
        toolName: "str_replace_editor",
        args: JSON.stringify({
          command: "create",
          path: `/components/${componentName}.jsx`,
          file_text: this.getComponentCode(componentType),
        }),
      };

      yield {
        type: "finish",
        finishReason: "tool-calls",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
        },
      };
      return;
    }

    // Step 2: Enhance component
    if (toolMessageCount === 2) {
      const text = `Now let me enhance the component with better styling.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(25);
      }

      yield {
        type: "tool-call",
        toolCallType: "function",
        toolCallId: `call_2`,
        toolName: "str_replace_editor",
        args: JSON.stringify({
          command: "str_replace",
          path: `/components/${componentName}.jsx`,
          old_str: this.getOldStringForReplace(componentType),
          new_str: this.getNewStringForReplace(componentType),
        }),
      };

      yield {
        type: "finish",
        finishReason: "tool-calls",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
        },
      };
      return;
    }

    // Step 3: Create App.jsx
    if (toolMessageCount === 0) {
      const text = `This is a static response. You can place an Anthropic API key in the .env file to use the Anthropic API for component generation. Let me create an App.jsx file to display the component.`;
      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(15);
      }

      yield {
        type: "tool-call",
        toolCallType: "function",
        toolCallId: `call_3`,
        toolName: "str_replace_editor",
        args: JSON.stringify({
          command: "create",
          path: "/App.jsx",
          file_text: this.getAppCode(componentName),
        }),
      };

      yield {
        type: "finish",
        finishReason: "tool-calls",
        usage: {
          promptTokens: 50,
          completionTokens: 30,
        },
      };
      return;
    }

    // Step 4: Final summary (no tool call)
    if (toolMessageCount >= 3) {
      const text = `Perfect! I've created:

1. **${componentName}.jsx** - A fully-featured ${componentType} component
2. **App.jsx** - The main app file that displays the component

The component is now ready to use. You can see the preview on the right side of the screen.`;

      for (const char of text) {
        yield { type: "text-delta", textDelta: char };
        await this.delay(30);
      }

      yield {
        type: "finish",
        finishReason: "stop",
        usage: {
          promptTokens: 50,
          completionTokens: 50,
        },
      };
      return;
    }
  }

  private getComponentCode(componentType: string): string {
    switch (componentType) {
      case "form":
        return `import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', formData);
    alert('Thank you! We\\'ll get back to you soon.');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Card container with glass effect */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white/50">
        {/* Decorative gradient orb */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full filter blur-3xl opacity-20" />

        {/* Header */}
        <div className="relative mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Get in Touch</h2>
          <p className="text-gray-500 mt-2">We'd love to hear from you</p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-6">
          <div className="group">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="group">
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Tell us what's on your mind..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;`;

      case "card":
        return `import React from 'react';

const Card = ({
  title = "Welcome to Our Service",
  description = "Discover amazing features and capabilities that will transform your experience.",
  imageUrl,
  actions,
  featured = false
}) => {
  return (
    <div className={\`group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 \${featured ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20' : 'shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-300/50'}\`}>
      {/* Gradient overlay for featured cards */}
      {featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-purple-500 text-white text-xs font-semibold px-4 py-1 rounded-bl-xl">
          Popular
        </div>
      )}

      {imageUrl && (
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        {actions && (
          <div className="pt-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;`;

      default:
        return `import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-10 border border-white/50 overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full filter blur-3xl opacity-20" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full filter blur-3xl opacity-20" />

      <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Counter</h2>
          <p className="text-gray-500 text-sm mt-1">Track your progress</p>
        </div>

        {/* Counter display */}
        <div className="flex items-center justify-center mb-10">
          <div className={\`text-7xl font-bold tabular-nums transition-all duration-300 \${count > 0 ? 'text-emerald-500' : count < 0 ? 'text-rose-500' : 'text-gray-900'}\`}>
            {count}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={decrement}
            className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={reset}
            className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 hover:text-gray-800 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={increment}
            className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Counter;`;
    }
  }

  private getOldStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form":
        return "We'd love to hear from you";
      case "card":
        return "Unlock the full potential";
      default:
        return "Track your progress";
    }
  }

  private getNewStringForReplace(componentType: string): string {
    switch (componentType) {
      case "form":
        return "We'd love to hear from you ✨";
      case "card":
        return "Unlock the full potential 🚀";
      default:
        return "Track your progress 📊";
    }
  }

  private getAppCode(componentName: string): string {
    if (componentName === "Card") {
      return `import Card from '@/components/Card';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <Card
          title="Premium Experience"
          description="Unlock the full potential of your workflow with our cutting-edge solution. Built for teams who demand excellence."
          featured={true}
          actions={
            <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Get Started →
            </button>
          }
        />
      </div>
    </div>
  );
}`;
    }

    return `import ${componentName} from '@/components/${componentName}';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      <div className="relative w-full max-w-md">
        <${componentName} />
      </div>
    </div>
  );
}`;
  }

  async doGenerate(
    options: Parameters<LanguageModelV1["doGenerate"]>[0]
  ): Promise<Awaited<ReturnType<LanguageModelV1["doGenerate"]>>> {
    const userPrompt = this.extractUserPrompt(options.prompt);

    // Collect all stream parts
    const parts: LanguageModelV1StreamPart[] = [];
    for await (const part of this.generateMockStream(
      options.prompt,
      userPrompt
    )) {
      parts.push(part);
    }

    // Build response from parts
    const textParts = parts
      .filter((p) => p.type === "text-delta")
      .map((p) => (p as any).textDelta)
      .join("");

    const toolCalls = parts
      .filter((p) => p.type === "tool-call")
      .map((p) => ({
        toolCallType: "function" as const,
        toolCallId: (p as any).toolCallId,
        toolName: (p as any).toolName,
        args: (p as any).args,
      }));

    // Get finish reason from finish part
    const finishPart = parts.find((p) => p.type === "finish") as any;
    const finishReason = finishPart?.finishReason || "stop";

    return {
      text: textParts,
      toolCalls,
      finishReason: finishReason as any,
      usage: {
        promptTokens: 100,
        completionTokens: 200,
      },
      warnings: [],
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
        },
      },
    };
  }

  async doStream(
    options: Parameters<LanguageModelV1["doStream"]>[0]
  ): Promise<Awaited<ReturnType<LanguageModelV1["doStream"]>>> {
    const userPrompt = this.extractUserPrompt(options.prompt);
    const self = this;

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        try {
          const generator = self.generateMockStream(options.prompt, userPrompt);
          for await (const chunk of generator) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return {
      stream,
      warnings: [],
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: {},
      },
      rawResponse: { headers: {} },
    };
  }
}

export function getLanguageModel() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.log("No ANTHROPIC_API_KEY found, using mock provider");
    return new MockLanguageModel("mock-claude-sonnet-4-0");
  }

  return anthropic(MODEL);
}

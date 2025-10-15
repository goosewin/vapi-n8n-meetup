import { LeadForm } from "@/components/lead-form";
import { Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Voice AI That Qualifies Leads
              <span className="text-primary"> Instantly</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              No more waiting hours for follow-up calls. Our AI assistant calls your leads the moment
              they express interest, qualifies them naturally, and feeds your CRM automatically.
            </p>
          </div>

          {/* Form */}
          <LeadForm />

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">{"<"}2 min</div>
              <div className="font-semibold">Response Time</div>
              <p className="text-sm text-muted-foreground">
                Instant calls to warm leads while they are still interested
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="font-semibold">Always Available</div>
              <p className="text-sm text-muted-foreground">
                Never miss a lead, even at 2 AM on weekends
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="font-semibold">Automated</div>
              <p className="text-sm text-muted-foreground">
                From qualification to CRM entry, zero manual work
              </p>
            </div>
          </div>

          {/* Demo Badge */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>
              🎯 This is a live demo powered by{" "}
              <a href="https://vapi.ai" className="font-semibold text-primary hover:underline">
                Vapi
              </a>
              {" "}+{" "}
              <a href="https://n8n.io" className="font-semibold text-primary hover:underline">
                n8n
              </a>
            </p>
            <p className="mt-2">
              Try it now - Submit the form and receive a real AI call!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

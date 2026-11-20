/**
 * MoogleLabs home page content.
 *
 * Based on the "Moogle Home Page" brief, tightened for the web while keeping
 * its meaning. Parts of the brief that are still placeholders (trust-bar
 * logos, case studies, tech stack, the "tools yet to be defined" panel,
 * testimonials and delivery time frames) are intentionally left out until
 * they are final.
 */

export const site = {
  name: "MoogleLabs",
  /** Home page variants, shown in the "Home" dropdown. */
  homes: [
    { label: "Home 1", href: "/" },
    { label: "Home 2", href: "/home-2" },
  ],
  nav: [
    { label: "Services", href: "#services" },
    { label: "Industries", href: "#industries" },
    { label: "Delivery", href: "#delivery" },
    { label: "Why MoogleLabs", href: "#why" },
    { label: "FAQ", href: "#faq" },
  ],
  /** Where every "talk to us" button points. Swap for a booking link when ready. */
  contactHref: "#next-steps",
};

export const hero = {
  eyebrow: "Enterprise AI Engineering",
  title: {
    lead: "From Experimental AI",
    tail: "to Production Intelligence",
  },
  body: "Most enterprise AI stalls between proof-of-concept and deployment. We engineer secure, governed, cost-efficient AI platforms that run reliably at scale inside your core operations.",
  primaryCta: { label: "Discuss Your AI Roadmap", href: "#next-steps" },
  secondaryCta: { label: "Explore Solutions", href: "#services" },
  friction: {
    question: "Where is your AI roadmap encountering friction?",
    hint: "Pick one to start",
    options: [
      { label: "We know AI can help, but where should we start?", href: "#stage-01" },
      { label: "Our AI pilots aren’t reaching production.", href: "#faq-1" },
      { label: "How can we make sense of complex, unstructured, and growing data?", href: "#cap-2" },
      { label: "How do we make AI secure, compliant and controllable?", href: "#cap-3" },
      { label: "Our AI costs are growing, but the value isn’t clear.", href: "#faq-5" },
    ],
  },
};

export type ServiceIcon =
  | "rocket"
  | "brain"
  | "bot"
  | "workflow"
  | "database"
  | "cloud"
  | "shield"
  | "flask"
  | "badge"
  | "blocks";

export const capabilities = {
  eyebrow: "Services",
  title: { lead: "Capabilities", tail: "& Solutions" },
  categories: [
    {
      index: "01",
      label: "Category 1",
      title: "Build & Scale AI",
      icon: "cpu",
      intro: "Transform models from lab experiments into resilient, revenue-generating enterprise software with our AI/ML services.",
      services: [
        {
          icon: "rocket" as ServiceIcon,
          title: "AI Implementation Services",
          body: "Deploy production-grade machine learning models into live environments with hardened security, minimal latency, and measurable business ROI.",
        },
        {
          icon: "brain" as ServiceIcon,
          title: "Enterprise Intelligence",
          body: "Unify predictive analytics and custom LLMs across operational workflows to accelerate executive decision-making and automate complex problem-solving.",
        },
        {
          icon: "bot" as ServiceIcon,
          title: "Agentic Operations",
          body: "Deploy autonomous AI agents that orchestrate multi-step business logic, interact with enterprise software, and execute complex workflows reliably.",
        },
        {
          icon: "workflow" as ServiceIcon,
          title: "Workflow Automation",
          body: "Eliminate manual bottlenecks with enterprise workflow automation that integrates intelligent agents across legacy architectures, enterprise ERPs, and modern cloud applications.",
        },
      ],
    },
    {
      index: "02",
      label: "Category 2",
      title: "Data Engineering & Cloud Infrastructure",
      icon: "server",
      intro: "Build the high-throughput, governed pipelines through specialized data engineering services and resilient cloud architectures.",
      services: [
        {
          icon: "database" as ServiceIcon,
          title: "AI-Ready Data Foundation",
          body: "Consolidate siloed enterprise data into structured, clean, and vector-indexed pipelines ready for high-accuracy model training and retrieval.",
        },
        {
          icon: "cloud" as ServiceIcon,
          title: "AI Cloud & Reliability",
          body: "Combine AI cloud engineering, continuous MLOps pipelines, and infrastructure guardrails for zero-downtime model serving at scale.",
        },
      ],
    },
    {
      index: "03",
      label: "Category 3",
      title: "Trust, Quality & Verification",
      icon: "lock",
      intro: "De-risk deployment through comprehensive compliance, model security, and quality assurance.",
      services: [
        {
          icon: "shield" as ServiceIcon,
          title: "AI Security & Governance",
          body: "Protect proprietary intellectual property, eliminate hallucinations, and enforce strict regulatory compliance through continuous model monitoring and guardrails.",
        },
        {
          icon: "flask" as ServiceIcon,
          title: "AI Testing",
          body: "Stress-test model accuracy, safety limits, and edge-case behavior before launch to prevent hallucination, drift, and unexpected runtime failures.",
        },
        {
          icon: "badge" as ServiceIcon,
          title: "AI Quality Engineering",
          body: "Accelerate traditional software release cycles using AI-driven automated testing, intelligent test design, and continuous regression analysis.",
        },
      ],
    },
    {
      index: "04",
      label: "Category 4",
      title: "Decentralized Architecture",
      icon: "network",
      intro: "Tamper-proof provenance, data sovereignty and distributed execution.",
      services: [
        {
          icon: "blocks" as ServiceIcon,
          title: "Web3 & Decentralized AI",
          body: "Distributed ledgers plus AI for cryptographic data provenance, secure compute sharing and verifiable model execution.",
        },
      ],
    },
  ],
};

export const industries = {
  eyebrow: "Industries We Serve",
  title: { lead: "Intelligence tailored", tail: "to how your sector works." },
  items: [
    { name: "Healthcare", icon: "health" },
    { name: "Logistics & Supply Chain", icon: "logistics" },
    { name: "Fintech", icon: "fintech" },
    { name: "EdTech", icon: "edtech" },
    { name: "Real Estate", icon: "realestate" },
    { name: "Manufacturing", icon: "manufacturing" },
    { name: "Insurance", icon: "insurance" },
    { name: "Construction", icon: "construction" },
    { name: "Government", icon: "government" },
  ],
};

export const enterprise = {
  eyebrow: "End-to-End Enterprise Delivery",
  title: { lead: "One team", tail: "for the full AI lifecycle." },
  body: "Every layer of the stack, backed by our own platform and product suite.",
  disciplines: ["AI", "Data", "Engineering", "Cloud", "Security", "Governance", "Automation"],
};

export const delivery = {
  eyebrow: "How we deliver",
  title: { lead: "The 7 Delivery", tail: "Stages" },
  stages: [
    {
      n: "01",
      name: "Discover",
      focus: "Commercial Feasibility & Technical Scoping",
      execution: "We audit data readiness, legacy constraints and bottlenecks to find viable, high-ROI use cases.",
      outcome: "Identify the right problems",
      solves: ["Enterprise AI Strategy & Opportunity Mapping"],
    },
    {
      n: "02",
      name: "Strategize",
      focus: "Use-Case Prioritization & Roadmapping",
      execution: "We weigh technical dependencies against business urgency to set milestones, resources and risk thresholds.",
      outcome: "A clear transformation plan",
      solves: ["Enterprise AI Strategy", "AI Value & Cost Optimization"],
    },
    {
      n: "03",
      name: "Architect",
      focus: "Platform, Vector & Infrastructure Design",
      execution: "We design data pipelines, model integration layers, vector storage and zero-trust security.",
      outcome: "An implementation blueprint",
      solves: ["AI-Ready Data Foundation", "AI PoC-to-Production"],
    },
    {
      n: "04",
      name: "Build",
      focus: "Full-Stack AI/ML & Data Pipeline Engineering",
      execution: "We build data ingestion, train or fine-tune task models, add RAG pipelines and deploy workflow agents.",
      outcome: "A production-grade solution",
      solves: ["AI-Ready Data Foundation", "AI PoC-to-Production"],
    },
    {
      n: "05",
      name: "Deploy",
      focus: "Cloud, MLOps & System Integration",
      execution: "We automate CI/CD/CT, containerized model serving, fallback routing and latency monitoring.",
      outcome: "Complete deployment",
      solves: ["AI PoC-to-Production Integration"],
    },
    {
      n: "06",
      name: "Govern",
      focus: "Model Safety, Guardrails & Auditability",
      execution: "We run continuous red-teaming, prompt-injection defenses, drift monitoring and compliance logging.",
      outcome: "Secure and compliant operations",
      solves: ["AI Security & Enterprise Governance"],
    },
    {
      n: "07",
      name: "Scale",
      focus: "Compute Optimization, FinOps & Continuous Learning",
      execution: "We quantize models, add caching, tune inference and support multi-tenant infrastructure.",
      outcome: "Sustainable enterprise adoption",
      solves: ["AI Value Optimization", "AI Implementation"],
    },
  ],
  governance: {
    title: "Governed end to end.",
    body: "Security, data and AI governance checks at every stage, not just the end.",
  },
};

export const why = {
  eyebrow: "Why MoogleLabs",
  title: { lead: "Not headcount. Not prototypes.", tail: "Operational capability." },
  body: "End-to-end ownership, from business problem to secure, governed, scalable AI.",
  items: [
    {
      icon: "target",
      title: "Business problem first, technology second",
      body: "We start from the outcome you need, then engineer the stack to deliver it.",
      differentiator: "Outcome-led, not technology-led",
    },
    {
      icon: "route",
      title: "PoC-to-production ownership",
      body: "We take prototypes all the way to dependable, mission-critical systems.",
      differentiator: "We stay through the hard part",
    },
    {
      icon: "key",
      title: "Full IP ownership & architectural independence",
      body: "You own 100% of your models, pipelines and code, built on open, portable standards.",
      differentiator: "Zero vendor lock-in",
    },
    {
      icon: "layers",
      title: "AI and data foundation together",
      body: "Data engineering, retrieval layers and security built alongside the model.",
      differentiator: "The foundation, not just the interface",
    },
    {
      icon: "shield",
      title: "Enterprise-grade by design",
      body: "Guardrails, zero-trust security, cost control and observability from day one.",
      differentiator: "Production-ready from the first commit",
    },
    {
      icon: "trending",
      title: "From one use case to an operating model",
      body: "Once value is proven, we build the platform to scale AI across the enterprise.",
      differentiator: "Point solutions to an AI-enabled enterprise",
    },
  ],
};

export const operatingModel = {
  eyebrow: "From one use case to an operating model",
  title: { lead: "We don't build isolated AI apps.", pre: "We build", highlight: "AI that scales." },
  body: "Once the first use case proves value, we put the architecture, data foundation, governance, reusable components and engineering practices in place, so every next use case is faster, cheaper and safer.",
  axis: "Business value",
  foundationsLabel: "Foundations that compound",
  stages: [
    { n: "01", title: "AI experiments", body: "Promising pilots, each built on its own." },
    { n: "02", title: "Repeatable AI capability", body: "Shared data, platforms, governance and patterns the next use case reuses." },
    { n: "03", title: "AI-enabled enterprise", body: "AI running across business functions, measured, governed and improving." },
  ],
  rows: [
    {
      label: "Architecture",
      cells: ["Designed for one use case", "Reference architecture, reused", "One enterprise AI platform"],
    },
    {
      label: "Data foundation",
      cells: ["Data for one use case", "Shared, governed data products", "Trusted knowledge layer"],
    },
    {
      label: "Governance",
      cells: ["Controls built in from day one", "Standard approval path", "One model for every use case"],
    },
    {
      label: "Reusable components",
      cells: ["First connectors and guardrails", "Component library", "New use cases in weeks"],
    },
    {
      label: "Engineering practices",
      cells: ["CI/CD and evaluation", "LLMOps on every release", "AI Center of Excellence"],
    },
  ],
  footnote: "Every stage measured with PRISM AI: quality, cost and reliability",
  cta: { label: "Plan your operating model", href: "#next-steps" },
};

export const finalCta = {
  eyebrow: "Next Steps",
  title: "Discuss your roadmap with an AI architect.",
  body: "In a focused 30-minute technical session, we’ll assess your constraints and map a practical path to production. No sales pitch, no commitment.",
  cta: { label: "Schedule a Technical Discovery Call", href: "#next-steps" },
  micro: ["Direct access to senior engineers", "Zero obligation"],
  stat: { value: "30", label: "Minute session" },
};

export const faq = {
  eyebrow: "FAQ",
  title: { lead: "Frequently", tail: "Asked Questions" },
  items: [
    {
      q: "How do you make sure our AI pilots reach production?",
      a: "Most proofs-of-concept fail because they’re built in isolated sandboxes. We engineer for production from day one, building data ingestion, MLOps pipelines, testing and fallback routing alongside the model.",
    },
    {
      q: "Who owns the IP, models and code after delivery?",
      a: "You do: 100% of the custom code, fine-tuned weights, pipelines and documentation. We build on open, portable frameworks with zero vendor lock-in, so your teams can run and extend everything independently.",
    },
    {
      q: "How do you protect our data, prevent hallucinations and stay compliant?",
      a: "Governance runs through every stage: private VPC or on-premise hosting so your data never trains public models, RAG grounded in verified sources, plus guardrails, red-teaming and audit logging.",
    },
    {
      q: "Our data is fragmented across legacy systems. Can we still start?",
      a: "Yes. There’s no need for a multi-year data overhaul. We build targeted, AI-ready pipelines for your first use cases, so you launch securely while modernizing the wider data foundation step by step.",
    },
    {
      q: "How do you keep compute and LLM costs under control?",
      a: "AI FinOps is built into the architecture: right-sized small language models, quantization, semantic caching and smart query routing instead of oversized models for every task. Costs scale predictably with value.",
    },
    {
      q: "How are you different from staffing agencies or AI boutiques?",
      a: "Agencies supply headcount without architectural accountability, and boutiques often lack enterprise depth in security, ERP integration and QA. We’re one accountable team across data, AI/ML, cloud MLOps, governance and QA.",
    },
    {
      q: "What does an engagement look like, and how fast are results?",
      a: "It depends on your maturity. A fixed-scope 2–4 week AI Readiness & Strategy Sprint validates feasibility and ROI; defined initiatives typically go live in 8–16 weeks, with milestone-based delivery throughout.",
    },
  ],
};

export const footer = {
  year: 2026,
  statement: "Not headcount. Not prototypes. Operational capability.",
  explore: [
    { label: "Services", href: "#services" },
    { label: "Industries", href: "#industries" },
    { label: "Enterprise delivery", href: "#enterprise" },
    { label: "Delivery stages", href: "#delivery" },
    { label: "Why MoogleLabs", href: "#why" },
    { label: "Operating model", href: "#operating-model" },
    { label: "FAQ", href: "#faq" },
  ],
};

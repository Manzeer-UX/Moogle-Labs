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
      intro: "Ensure tamper-proof provenance, data sovereignty, and distributed execution.",
      services: [
        {
          icon: "blocks" as ServiceIcon,
          title: "Web3 & Decentralized AI",
          body: "Combine distributed ledgers with artificial intelligence to ensure cryptographic data provenance, secure compute sharing, and verifiable model execution.",
        },
      ],
    },
  ],
};

export const industries = {
  eyebrow: "Industries We Serve",
  title: { lead: "Intelligence tailored", tail: "to how your sector actually operates." },
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
  title: { lead: "One unified team", tail: "across the full enterprise AI lifecycle." },
  body: "One team across the whole AI stack, backed by our own platform and product suite.",
  disciplines: ["AI", "Data", "Engineering", "Cloud", "Security", "Governance", "Automation"],
};

export const delivery = {
  eyebrow: "How we deliver",
  title: { lead: "The 7 Delivery", tail: "Stages" },
  stages: [
    {
      n: "01",
      name: "Discover",
      duration: "1–2 weeks",
      focus: "Commercial Feasibility & Technical Scoping",
      execution: "We audit data readiness, legacy architecture constraints, and operational bottlenecks to define technically viable, high-ROI target applications.",
      outcome: "Identify the right problems",
      solves: ["Enterprise AI Strategy & Opportunity Mapping"],
    },
    {
      n: "02",
      name: "Strategize",
      duration: "1–2 weeks",
      focus: "Use-Case Prioritization & Commercial Roadmapping",
      execution: "We map technical dependencies against business urgency, defining delivery milestones, infrastructure resource requirements, and risk thresholds.",
      outcome: "A clear transformation plan",
      solves: ["Enterprise AI Strategy", "AI Value & Cost Optimization"],
    },
    {
      n: "03",
      name: "Architect",
      duration: "2–3 weeks",
      focus: "Platform, Vector, & Infrastructure Design",
      execution: "We design production data pipelines, foundation model integration layers, vector storage, and zero-trust security postures.",
      outcome: "An implementation blueprint",
      solves: ["AI-Ready Data Foundation", "AI PoC-to-Production"],
    },
    {
      n: "04",
      name: "Build",
      duration: "4–8 weeks",
      focus: "Full-Stack AI/ML development & Data Pipeline Engineering",
      execution: "We develop clean data ingestion flows, train or fine-tune task-specific models, build retrieval pipelines (RAG), and deploy autonomous workflow agents.",
      outcome: "A production-grade solution",
      solves: ["AI-Ready Data Foundation", "AI PoC-to-Production"],
    },
    {
      n: "05",
      name: "Deploy",
      duration: "1–2 weeks",
      focus: "Cloud, DevOps, MLOps, Orchestration, & System Integration",
      execution: "We automate continuous delivery pipelines (CI/CD/CT), containerized model serving, fallback routing, and latency-budget monitoring.",
      outcome: "Complete deployment",
      solves: ["AI PoC-to-Production Integration"],
    },
    {
      n: "06",
      name: "Govern",
      duration: "Continuous",
      focus: "Model Safety, Guardrails, & Auditability",
      execution: "We implement continuous red-teaming, automated prompt-injection defenses, drift monitoring, and compliance logging across the full stack.",
      outcome: "Secure and compliant operations",
      solves: ["AI Security & Enterprise Governance"],
    },
    {
      n: "07",
      name: "Scale",
      duration: "Ongoing",
      focus: "Compute Optimization, FinOps, & Continuous Learning",
      execution: "We run model quantization, caching strategies, active inference tuning, and sustained multi-tenant infrastructure support.",
      outcome: "Sustainable enterprise adoption",
      solves: ["AI Value Optimization", "AI Implementation"],
    },
  ],
  governance: {
    title: "Governed end to end.",
    body: "Security, data and AI governance checks run at every stage, not just at the end.",
  },
};

export const why = {
  eyebrow: "Why MoogleLabs",
  title: { lead: "We do not sell headcount or prototypes.", tail: "We deliver operational capability." },
  body: "An end-to-end transformation partner, taking ownership from the business problem to a secure, governed, and scalable AI/ML solutions.",
  items: [
    {
      icon: "target",
      title: "Business problem first, technology second",
      body: "We start with the commercial outcome you need, then engineer the stack that achieves it.",
      differentiator: "Outcome-led, not technology-led",
    },
    {
      icon: "route",
      title: "PoC-to-production ownership",
      body: "We bridge the gap between experimental prototypes and dependable, mission-critical systems.",
      differentiator: "We stay through the hard part",
    },
    {
      icon: "key",
      title: "Full IP ownership & architectural independence",
      body: "You retain 100% ownership of your custom models, data pipelines, and codebase; built on open, portable standards without proprietary platform traps.",
      differentiator: "Zero vendor lock-in",
    },
    {
      icon: "layers",
      title: "AI and data foundation together",
      body: "Data engineering, knowledge retrieval layers, and security controls built alongside the model.",
      differentiator: "The foundation, not just the interface",
    },
    {
      icon: "shield",
      title: "Enterprise-grade by design",
      body: "Model guardrails, zero-trust security, cost optimization, and observability embedded from day one.",
      differentiator: "Production-ready from the first commit",
    },
    {
      icon: "trending",
      title: "From one use case to an operating model",
      body: "Once initial value is proven, we establish the platform architecture to scale AI across the enterprise.",
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
  title: "Discuss your roadmap with an AI solutions architect.",
  body: "Share where your team is facing friction. In a focused 30-minute technical session, we will assess your current constraints and outline a practical path toward production. No sales pitch, no commitment.",
  cta: { label: "Schedule a Technical Discovery Call", href: "#next-steps" },
  micro: ["Direct access to senior engineering leads", "Zero obligation"],
  stat: { value: "30", label: "Minute session" },
};

/* ------------------------------------------------------------------------ */
/* Sections the content doc lists with a heading only. The entries below are */
/* PLACEHOLDER (synthetic) content: swap in real logos, case studies, tools  */
/* and testimonials before launch.                                            */
/* ------------------------------------------------------------------------ */

export const trust = {
  label: "Trusted by Teams At",
  // Fictional organisations, shown as wordmarks until real client logos are approved.
  logos: [
    { name: "Northwind Health", mark: "health" },
    { name: "Atlas Freight", mark: "logistics" },
    { name: "Lumen Capital", mark: "fintech" },
    { name: "Brightpath Learning", mark: "edtech" },
    { name: "Keystone Realty", mark: "realestate" },
    { name: "Forge Industrial", mark: "manufacturing" },
    { name: "Harbor Mutual", mark: "insurance" },
    { name: "Summit Build Co.", mark: "construction" },
    { name: "CivicGrid", mark: "government" },
  ],
};

export const caseStudies = {
  eyebrow: "Case Studies",
  title: "Work we've delivered. Proof, not promises",
  items: [
    {
      industry: "Healthcare",
      client: "Regional healthcare network",
      title: "Clinical document intelligence in production",
      summary:
        "A governed RAG platform that reads referral letters and discharge notes, routes cases and drafts summaries inside the existing EHR workflow.",
      metrics: [
        { value: "68%", label: "Faster case triage" },
        { value: "12 wks", label: "PoC to production" },
        { value: "0", label: "PHI leaving the VPC" },
      ],
    },
    {
      industry: "Logistics & Supply Chain",
      client: "Global freight forwarder",
      title: "Agentic exception handling across 40+ lanes",
      summary:
        "Autonomous agents that detect shipment exceptions, query carrier systems and resolve or escalate them with a full audit trail.",
      metrics: [
        { value: "3.4×", label: "Exceptions handled per agent" },
        { value: "41%", label: "Fewer late deliveries" },
        { value: "24/7", label: "Coverage without new headcount" },
      ],
    },
    {
      industry: "Fintech",
      client: "Mid-market digital lender",
      title: "Cost-optimised credit decisioning",
      summary:
        "Right-sized models, semantic caching and smart routing replaced a single large model, with drift monitoring and explainability for regulators.",
      metrics: [
        { value: "57%", label: "Lower inference cost" },
        { value: "<300ms", label: "P95 decision latency" },
        { value: "100%", label: "Decisions explainable" },
      ],
    },
  ],
  cta: { label: "Discuss a similar project", href: "#next-steps" },
};

export const techStack = {
  eyebrow: "Technology Ecosystem",
  title: "Engineered to integrate with your existing enterprise stack.",
  body: "We work inside the platforms you already run, so new AI capability plugs into today's data, cloud and security estate instead of replacing it.",
  // Representative tooling; confirm the final list before launch.
  groups: [
    { name: "Cloud", items: ["AWS", "Microsoft Azure", "Google Cloud", "Private VPC / On-prem"] },
    { name: "Data", items: ["Snowflake", "Databricks", "PostgreSQL", "Kafka", "Airflow", "dbt"] },
    { name: "AI & LLMs", items: ["PyTorch", "Hugging Face", "OpenAI", "Anthropic", "Llama", "LangChain"] },
    { name: "Retrieval", items: ["pgvector", "Pinecone", "Weaviate", "Elasticsearch"] },
    { name: "MLOps", items: ["MLflow", "Kubeflow", "Weights & Biases", "SageMaker", "Vertex AI"] },
    { name: "Platform & Security", items: ["Kubernetes", "Docker", "Terraform", "GitHub Actions", "Vault"] },
  ],
};

export const testimonials = {
  eyebrow: "Testimonials",
  title: "Don't take our word for it. Take theirs.",
  // Placeholder quotes with anonymised roles; replace with approved client testimonials.
  items: [
    {
      quote:
        "MoogleLabs took a pilot that had been stuck for a year and had it running in production in a quarter, with the security sign-off our board needed.",
      role: "VP of Data & AI",
      company: "Regional healthcare network",
    },
    {
      quote:
        "They didn't just build a model. They built the pipelines, guardrails and monitoring around it, and our team owns every line of it.",
      role: "Chief Technology Officer",
      company: "Global freight forwarder",
    },
    {
      quote:
        "Our inference bill dropped by more than half while accuracy went up. The FinOps thinking was built in from the first architecture review.",
      role: "Head of Engineering",
      company: "Digital lending platform",
    },
  ],
};

export const faq = {
  eyebrow: "FAQ",
  title: { lead: "Frequently", tail: "Asked Questions" },
  items: [
    {
      q: "How do you ensure our AI pilots actually reach production instead of stalling in testing?",
      a: "Most proofs-of-concept fail because they are built in isolated sandboxes without accounting for live data pipelines, latency budgets, or security requirements. We engineer for production constraints from day one, building data ingestion, MLOps deployment pipelines, automated testing, and fallback routing concurrently with the model so your system integrates cleanly into existing enterprise infrastructure.",
    },
    {
      q: "Who owns the intellectual property, custom models, and codebase once a project is delivered?",
      a: "You retain 100% ownership of all custom code, fine-tuned weights, data pipelines, and architectural documentation. We build on open, portable cloud and MLOps frameworks with zero proprietary vendor lock-in, ensuring your internal teams can maintain, audit, and extend the platform independently.",
    },
    {
      q: "How do you protect proprietary enterprise data, prevent model hallucinations, and ensure compliance?",
      a: "Governance is embedded across every stage of delivery rather than treated as a post-launch checklist. We deploy private VPC or on-premise model hosting so your data never trains public third-party models, enforce Retrieval-Augmented Generation (RAG) grounded strictly in verified enterprise sources, and implement automated guardrails, red-teaming, and audit logging aligned with your regulatory standards.",
    },
    {
      q: "Our enterprise data is currently fragmented across legacy systems. Can we still start an AI initiative?",
      a: "Yes. You do not need a multi-year data warehouse overhaul before capturing AI value. Our data engineering team builds targeted, AI-ready ingestion and vector pipelines specifically scoped to the workflows required for your initial use cases. This allows you to launch securely while modernizing your broader data foundation incrementally.",
    },
    {
      q: "How do you keep cloud compute and LLM inference costs from spiraling as usage grows?",
      a: "We incorporate AI FinOps directly into our architecture. Rather than defaulting to oversized, expensive foundation models for every task, we optimize unit economics through right-sized small language models (SLMs), model quantization, semantic caching, and intelligent query routing. This ensures infrastructure costs scale predictably alongside business value.",
    },
    {
      q: "How does MoogleLabs differ from traditional IT staffing agencies or niche AI boutiques?",
      a: "Staffing agencies supply disconnected headcount without architectural accountability, while niche AI boutiques often lack the enterprise engineering depth required for cloud security, legacy ERP integration, and quality assurance. We provide a single, accountable team covering the full stack: data engineering, AI/ML development, cloud MLOps, security governance, and automated QA.",
    },
    {
      q: "What does a typical engagement look like, and how quickly can we see measurable results?",
      a: "Engagements are structured around your current maturity. For organizations defining their roadmap, a fixed-scope 2 to 4 week AI Readiness & Strategy Sprint validates feasibility and ROI. For defined initiatives, production-grade deployments typically reach live operational environments within 8 to 16 weeks, using milestone-based delivery so you see working capability early.",
    },
  ],
};

export const footer = {
  year: 2026,
  statement: "Not headcount. Not prototypes. Operational capability.",
  explore: [
    { label: "Services", href: "#services" },
    { label: "Industries", href: "#industries" },
    { label: "Case studies", href: "#case-studies" },
    { label: "Enterprise delivery", href: "#enterprise" },
    { label: "Tech stack", href: "#tech-stack" },
    { label: "Delivery stages", href: "#delivery" },
    { label: "Why MoogleLabs", href: "#why" },
    { label: "Operating model", href: "#operating-model" },
    { label: "FAQ", href: "#faq" },
  ],
};

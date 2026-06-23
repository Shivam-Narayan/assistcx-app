# AssistCX Documentation Preview

This is a preview of the AssistCX documentation. It is a work in progress and is not yet complete.

## Getting Started (Section-1)
### Overview (Page-1)
  - what is assistcx, How assistcx works
### Platform Overview (Page-2)
  - When should I use assistcx
  - Who uses assistcx
  - What makes assistcx unique
### Key Concepts (Page 3)
  containing all the definition in short
  - Agents 
  - Tools 
  - Task
  - Knowledge
  - Issue Management
  - Intergations

### FAQs (Page 4)
- How do I login and start?
- How do I connect my mailbox?
- Where do I see new emails/tasks?
- How do I know if my agent is working?
- What to do if output looks wrong?

--- 

## Agents (Section-2)

### Agent Overview (Page-1)
- What is an Agent?
  - Proper description of what agents are
  - Common Agent Use cases

### Agent Architecture (Page-2)
  - Majorly contain diagram for it 
  - How Agents work in AssistCX (Intent → Task → Output)

### Create an Agent (Page-3)
- Start from scratch
- Import agent
- Agent Builder

### Start from Scratch (Page-4)
  - [Sub Page 1] Identity
  - [Sub Page 2] Capabilities
  - [Sub Page 3] Knowledge connection
  - [Sub Page 4] Tools connection
  - [Sub Page 5] Response behavior
  - [Sub Page 6] Access & visibility
### Import Agent (Page-5)
  - [Sub Page 1] Agent Configuration file
### Agent Builder (Page-6)
  - [Sub Page 1] Required Inputs
  - [Sub Page 2] Auto-Generated Confirguration

### Version History and Restore (Page-6)
- Version History - Records and Rollback options 

---

## Tools (Section-3)

### Tools Overview (Page-1)
- What are Tools?
- Why agents need tools
- Why tools are reusable

### Tool Types (Page-2)
- Integration tools
- System Tools
- API or Customize tools

### Create a Tool (Page-3)
- Tool name & purpose
- Inputs required
- Output response format
- Test Tools

---

## Inbox (Section-4)

### Inbox Overview (Page-1)
- What is Task Inbox?
- Core Workflows

### Views (Page-2)
- [Sub Page 1] Email View
   - Email view details
   - Actions menu
   - Task creations triggers
- [Sub Page 2] Task View
   - Task fields
   - Activity Menu
   - Task creation triggers

### Task Generation (Page-3)
  - how would the task platform generates the task?
### Task Execution (Page-4)
  - how agent executes the task
### Task Actions (Page-5)
  - That page will describe all the actions that are available to us on the task and that will contain    task action like changing status, adding notes and comments. Retry, continue task execution.

---

## Knowledge (Section-5)

### Knowledge Overview (Page-1)
- What is Knowledge in AssistCX?
- When to use Knowledge 

### Knowledge Management (Page-2)
- [Sub Page 1] Collections
    - Create/update/delete collections
    - Metadata and Knowledge topics
- [Sub Page 2] Import
    - Local Upload files
    - Import from SharePoint
- [Sub Page 3] Documents
    - Supported formats

### Use Knowledge with Agents (Page-3)
- Link knowledge to an agent
- Search & retrieval behavior

---

## Integrations (Section-6)

### Integrations Overview (Page-1)
- What integrations do in AssistCX
- When integration is required
- Integrations Types
- Common usage scenarios
### LLM Intergation (Page-2)
 - [Sub Page 1] Open ai
 - [Sub Page 2] Gemini
 - [Sub Page 3] Anthropic
### External Apps (Page-3)
 - [Sub Page 1] overview
 - [Sub Page 2] Sharepoint (Data Storage)
 - [Sub Page 3] Outlook (EMAIL)
 - [Sub Page 4] AWS S3 (Cloud Storage)
---

## Issue Management (Section-7)

### Issue Management Overview (Page-1)
- What is Issue Management?
- What is issue management
- Why issue exist
- Email-level vs Task-level issues

### Report an Issue (Page-2)
-  Report from task view
    - Raise an issue from Task Details
    - Linkage to task/email
- Report Issue form

### Issues Lifecycle (Page-3)
- Just purely containing issue lifecycle

---

## Assistant (Section - 8)

### Assistant Overview (Page - 1)
- What Assistant is
- When to use Assistant
- Assistant vs Agents
- Key benefits (fast answers, context-aware, knowledge-backed)

### Assistant Walkthrough (Page - 2)
- Landing page overview
     - Chat interface layout (input box, send, attachments)
     - Chat experience (ask → retrieve → answer)
- Response behavior (formatting, citations, confidence)
- Follow-up questions and context handling

### Assistant Tasks (Page - 3)
- What tasks mean in Assistant
- How tasks are scheduled
- Running tasks manually vs scheduled tasks
- Task status
- Task notifications

### Assistant Context Management 
- [Sub Page 1] History
- Conversation history overview
- Viewing previous chats
- Search in history
- Resume conversation behavior
- Archieve history

- [Sub Page 2] Assistant My Files
- Upload files supported (PDF/DOCX/CSV/etc.)
- Upload and manage files
- File size limits
- Remove/replace files
- Using uploaded files in chat queries

- [Sub Page 3] How Assistant Uses Knowledge
- Knowledge sources used (Collections, Documents)
- How retrieval works (search + context building)
- How Assistant chooses relevant data

---

## Settings & Admin (Section-9)

### Settings Overview (Page-1)
- What comes under settings
- Admin responsibilities

### Mailbox Polling (Page-2)
- Mailbox list
- Start polling
- Backdate polling
- Polling frequency
- Polling logs

### User Roles & Permissions (Page-3)
- Role types
- Module access
- Permission mapping

### Data Templates (Page-4)
- Template list
- Template builder fields
- Validation rules
- Versioning

### Intent Classes (Page-5)
- Intent list
- Confidence threshold
- Agent mapping

----------------------------------------------------------------------------------------------------------

# Guide Section

## System Walkthroughs (Section - 1)
**Purpose:** Visual, step-by-step understanding of how AssistCX works

### Walkthrough the AssistCX System
- End-to-end platform walkthrough (GIF / video)
- Email → Agent → Task → Output flow
- What happens behind the scenes
- Where users typically intervene

---

## End-to-End Automation (Section - 2)
**Purpose:** Walkthroughs + real usage flows (conceptual + practical)

### From Email to Output
- How an email is interpreted
- Agent reasoning
- Task creation & completion

### Building Your First Automation
- Recommended setup order
- Validation checklist
- Common mistakes

### Handling Ambiguity, Retries & Failures
- Retry vs Continue
- Avoiding duplicate or stuck tasks

---

## Designing Intelligence (Agents & Assistant) (Section - 3)
**Purpose:** Clarify intelligence models and best practices

### (Page - 1) Agents vs Assistant
- What Agents are designed for
- What Assistant is designed for
- When to use Agent vs Assistant
- Common misuse scenarios

### (Page - 2) Translating Business Intent into Agent Logic
- Writing clear intents
- Good vs bad examples
- Handling edge cases
- When to Split One Agent into Multiple Agents

### (Page - 3) Agent Instructions & Response Behavior
- Instruction hierarchy
- Controlling output format & tone
- Predictable responses

---

## Operating & Optimizing AssistCX (Section - 4)
**Purpose:** Day-to-day usage + continuous improvement

### Managing Tasks & Inboxes
- Task statuses explained
- High-volume inbox handling
- Manual overrides
- Understanding Retry vs Continue Tasks

### Reducing Incomplete or Incorrect Tasks
- Root cause analysis
- Debugging checklist
- Common failure patterns

### Improving Accuracy Over Time
- Measuring quality signals
- Iterative improvements
- When to tweak vs redesign

---

## Scaling & Governance (Page - 5)
**Purpose:** Long-term, stable, multi-team usage

### Safe & Responsible Usage
- Role-based access
- Sensitive data handling

## Best Practices for Better Results (Section - 6)
**Purpose:** Help users get consistent and reliable outcomes

### (Page - 1) Best Practices for Agents
- Writing clear agent intent
- Avoiding over-complex logic
- Keeping agents predictable

### (Page - 2) Best Practices for Tools & Knowledge
- How to Decide: Tool vs Knowledge vs Prompt
- Best Practices for Connecting Knowledge Sources
- Structuring Documents for Better AI Retrieval
- Tool Chaining: When & How to Use Multiple Tools
- Handling Failures & Edge Cases Gracefully
- What type of data works best
- What to avoid uploading

### (Page - 3) Best Practices for Tasks & Outputs
- Designing clean task flows
- Avoiding duplicate or looping tasks
- Keeping outputs usable

## Troubleshooting & Fixes (Page - 7)
**Purpose:** Help users fix issues on their own

### Why Outputs Feel Incorrect
- Agent configuration issues
- Knowledge-related issues
- Input email problems

### Debugging Incomplete Tasks
- Common root causes
- Step-by-step checks
- When to redesign instead of tweaking

### Common Mistakes to Avoid
- Over-automation
- Poor agent boundaries
- Misuse of Assistant or Knowledge









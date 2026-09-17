# GreenChain

> **Decentralized Carbon Credit Infrastructure & Ecological Verification Protocol**

GreenChain is a decentralized platform connecting regenerative agriculture and ecological restoration with global corporate liquidity. By leveraging distributed ledgers and on-chain telemetry, GreenChain replaces trust with cryptographic verification to ensure every carbon offset is backed by real-world biological growth.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.13-2535A0?style=flat-square&logo=ethereum&logoColor=white)](https://docs.ethers.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

---

## Key Features & Platform Roles

GreenChain is designed around three distinct ecosystem roles, each equipped with dedicated workflows and dashboards:

### 1. Project Developer (Farmer / Reforester)
- **Submit Restoration Projects**: Upload GPS coordinates, tree counts, canopy imagery, and select species (Oak, Mangrove, Pine, Spruce, Beech, Maple, etc.).
- **Automated Yield Calculation**: Species-specific carbon sequestration models calculate projected Verified Carbon Credits (VCC) based on annual CO2 absorption rates.
- **Ecological Tracking**: Monitor submitted project statuses through verification stages.

### 2. Corporate Buyer (Company)
- **Carbon Credit Marketplace**: Explore verified offsets categorized across Reforestation, Renewable Energy, and Wetland Conservation with real-time pricing and availability.
- **Offset Retirement Engine**: Burn and permanently retire purchased credits on-chain to offset corporate carbon footprints.
- **Cryptographic Retirement Certificates**: Generate and download authentic certificates of retirement complete with unique certificate numbers, timestamps, and on-chain transaction hashes.
- **Portfolio Analytics**: Track historical purchases, retired offsets, and total metric tons of CO2 sequestered.

### 3. System Administrator (Verifier)
- **Verification Queue**: Review incoming ecological submissions and site documentation.
- **Telemetry Validation**: Validate canopy density compliance against satellite telemetry.
- **On-Chain Minting**: Approve verified projects and trigger token minting directly to developer addresses.

---

## Instant Demo & Vercel Ready

GreenChain is designed to be hosted seamlessly on **Vercel** as a standalone frontend without requiring a local backend or MetaMask installation:

- **Instant Demo Access**: From the landing page or connect page, visitors can launch immediately into any persona (**Project Developer**, **Corporate Buyer**, or **System Admin**) with 1 click.
- **Client-Side Mock Engine**: Includes pre-populated projects, active marketplace listings, historical transactions, and pending queue items. User actions (submitting projects, buying credits, burning offsets, verifying submissions) mutate local state and persist across browser reloads.
- **Preset Helpers**: Sample filler buttons and quick quantity presets allow immediate, zero-friction testing of every modal and workflow.
- **SPA Routing**: Pre-configured `vercel.json` rewrite rules ensure deep routes (`/dashboard`, `/marketplace`, `/admin`, `/connect`) resolve cleanly upon direct access or page refresh.

---

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Web3 Integration**: Ethers.js v6 (Ethereum Sepolia testnet support)
- **Notifications**: Sonner

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ayazkhan-in/GreenChain.git
   cd GreenChain
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## Production Build

To test and compile the production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Deploying to Vercel

1. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
2. Set the framework preset to **Vite**.
3. Set the build command to `npm run build` and output directory to `dist`.
4. The included `vercel.json` automatically handles single-page application (SPA) routing for all routes.

---

## Project Structure

```text
├── public/               # Static assets
├── src/
│   ├── assets/           # Images and brand graphics
│   ├── components/       # UI components & route guards
│   │   ├── ui/           # shadcn/ui primitive components
│   │   ├── Navbar.tsx    # Header with role badge, address copy & logout
│   │   ├── Footer.tsx    # Footer component
│   │   └── RoleRoute.tsx # Route protection & persona redirection
│   ├── context/
│   │   └── Web3Context.tsx # Web3 & demo wallet state provider
│   ├── lib/
│   │   ├── api.ts        # Intelligent API layer with mock fallbacks
│   │   ├── mockStore.ts  # Client-side state persistence engine
│   │   ├── contracts.ts  # Contract ABIs and network addresses
│   │   └── animations.ts # Framer motion variants
│   ├── pages/
│   │   ├── Landing.tsx             # Public landing page & demo launcher
│   │   ├── ConnectWallet.tsx       # Wallet connection & persona selector
│   │   ├── FarmerDashboard.tsx     # Developer/Farmer project portal
│   │   ├── CompanyDashboard.tsx    # Corporate offset portfolio & retirement
│   │   ├── CompanyMarketplace.tsx  # Carbon credit marketplace
│   │   ├── AdminPanel.tsx          # Administrator verification queue
│   │   └── NotFound.tsx            # 404 handler
│   ├── App.tsx           # Router configuration
│   └── main.tsx          # Application entry point
├── vercel.json           # Vercel rewrite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── vite.config.ts        # Vite configuration
```

---

## License

This project is licensed under the MIT License.

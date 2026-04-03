import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/ui/text-effect";
import { ArrowRight, Leaf, Shield, Coins } from "lucide-react";
import heroForest from "@/assets/hero-forest.jpg";
import { containerVariants, itemVariants, slideInLeft, cardVariants, staggerContainer, staggerItem } from "@/lib/animations";

export default function Landing() {
  const { account, connectWallet, isConnecting } = useWeb3();

  const blurSlideVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.01 },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        filter: 'blur(10px) brightness(0%)',
        y: 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px) brightness(100%)',
        transition: {
          duration: 0.4,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-40 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="container relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100/80 backdrop-blur px-4 py-2 text-xs font-semibold uppercase tracking-wider text-green-700 border border-green-200">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Verified Ecological Assets
          </span>
          <div>
            <TextEffect 
              as="div" 
              per="char" 
              variants={blurSlideVariants}
              className="mt-8 text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tight"
            >
              Earn Carbon Credits by
            </TextEffect>
            <TextEffect 
              as="div" 
              per="char" 
              variants={blurSlideVariants}
              delay={0.1}
              className="text-5xl md:text-7xl font-black text-green-600 leading-tight tracking-tight"
            >
              Planting Trees
            </TextEffect>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-gray-600 font-medium">
            The leading decentralized infrastructure connecting regenerative agriculture with global corporate liquidity.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10 flex items-center justify-center gap-4 flex-wrap"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="lg" className="rounded-full px-8 py-6 bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 text-base">
                <Link to="/connect">Get Started</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="rounded-full px-8 py-6 border-2 border-gray-800 text-gray-800 hover:bg-gray-50 font-bold shadow-md transition-all duration-200 text-base" asChild>
                <Link to="/connect">Connect Wallet</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              High-fidelity climate<br />infrastructure.
            </h2>
            <p className="mt-4 max-w-lg text-gray-600 text-lg">
              We replace trust with verification. Our protocol utilizes distributed ledgers to ensure every asset is backed by real-world biological growth.
            </p>
          </motion.div>
          <motion.div 
            className="mt-16 grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: <Coins className="h-7 w-7" />, title: "Yield Generation", desc: "Project developers earn direct digital asset yields for verified ecological restoration efforts.", link: "Explore Yields" },
              { icon: <Shield className="h-7 w-7" />, title: "Asset Liquidity", desc: "Permissionless secondary markets provide instant settlement for corporate offsets.", link: "Trade Now" },
              { icon: <Leaf className="h-7 w-7" />, title: "On-Chain Proof", desc: "Immutable verification records eliminate the risk of double-spending offsets.", link: "View Protocol" },
            ].map((f, index) => (
              <motion.div 
                key={f.title} 
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:border-green-300"
              >
                <div className="inline-flex items-center justify-center rounded-lg bg-green-50 p-3 text-green-600">{f.icon}</div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="mt-3 text-gray-600">{f.desc}</p>
                <a href="#" className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-green-600 hover:text-green-700 transition-colors">
                  {f.link} <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Global Impact */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <motion.div 
            className="grid md:grid-cols-2 gap-16 items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div className="relative" variants={slideInLeft}>
              <img src={heroForest} alt="Tropical rainforest" className="rounded-3xl shadow-xl" width={1280} height={864} />
              <motion.div 
                className="absolute bottom-6 left-6 rounded-2xl bg-green-500 px-6 py-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-3xl font-black text-white">Secure</p>
                <p className="text-xs font-bold uppercase tracking-wider text-green-100">on BlockChain</p>
              </motion.div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                Global impact,<br />pixel-perfect proof.
              </h2>
              <p className="mt-5 text-gray-600 text-lg leading-relaxed">
                By merging satellite computer vision with hardware-attested IoT sensors, GreenChain provides the most rigorous verification layer in the decentralized carbon economy.
              </p>
              <motion.div 
                className="mt-8 space-y-5"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={staggerItem} className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-green-100 p-2 flex-shrink-0"><Shield className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Biometric Digital Twins</h4>
                    <p className="text-gray-600 mt-1">Every organism is mapped to a unique non-fungible identifier (NFT).</p>
                  </div>
                </motion.div>
                <motion.div variants={staggerItem} className="flex items-start gap-4">
                  <div className="mt-1 rounded-lg bg-green-100 p-2 flex-shrink-0"><Coins className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Real-time Oracle Data</h4>
                    <p className="text-gray-600 mt-1">Live sensor feeds pipe ecological health metrics directly to the ledger.</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="container">
          <motion.div 
            className="rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 md:px-12 py-16 md:py-20 text-center shadow-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            whileHover={{ scale: 1.02 }}
          >
            <motion.h2 className="text-4xl md:text-5xl font-black text-white" variants={itemVariants}>Ready to green your chain?</motion.h2>
            <motion.p className="mx-auto mt-4 max-w-lg text-white/90 text-lg" variants={itemVariants}>
              Join the world's most transparent carbon ecosystem and start minting verified assets.
            </motion.p>
            <motion.div className="mt-10 flex items-center justify-center gap-4 flex-wrap" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Button variant="secondary" size="lg" className="rounded-full px-8 py-6 bg-white text-green-600 hover:bg-gray-50 font-bold shadow-md transition-all duration-200 text-base" asChild>
                  <Link to="/connect">Launch Application</Link>
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button size="lg" className="rounded-full px-8 py-6 border-2 border-white text-white hover:bg-white/10 font-bold transition-all duration-200 text-base bg-transparent" asChild>
                  <Link to="/connect">View Ecosystem</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

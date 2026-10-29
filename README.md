# LUMASHIFT — Ambient-Lighting & Optical Environment Appearance Architect
> **Target Illuminant Calibration to Parametric YouCam Virtual Try-On Synthesis**

---

## 🌟 The Innovation
Cosmetics and clothing chosen under vanity lights (typically 2700K incandescent or 4000K warm LED) radically degrade under destination lighting:
- **5500K Corporate Fluorescent:** Destroys warm subcutaneous skin reflectance, causing a chalky, sickly cast.
- **2100K Candlelight:** Low lux causes berry and crimson lipsticks to reflect zero light, appearing as black voids.
- **Stage & HD Ring Lights:** 800+ lux blows out specular shimmer textures into flat white camera sensor clipping.

**LumaShift** replaces static post-processing filters with **Environment-Synchronized Multi-Modal Styling**. It calculates the inverse chromatic transform using a Planckian blackbody locus matrix and programmatically configures Perfect Corp's YouCam Makeup and Clothes Changer REST APIs.

---

## 🚀 Live Testing Options for Reviewers and Judges

### 1. Instant 1-Click Interactive Mode (Zero Configuration Required)
This repository includes a deterministic **WebGL Planckian Shader Engine** in `components/ViewportSimulator.tsx` and `lib/optical-physics.ts`.
- Open the application.
- Click any of the **"Judge Fast-Track Demos"** at the top (`Executive Crisis`, `Candlelight Bistro`, or `Desk-to-Dinner`).
- Drag the split-screen comparison slider to inspect the exact optical compensation.
- Adjust the Kelvin slider from 1800K to 9000K in real time.
- Open the **Telemetry** button on the top right to view Planckian matrix transforms and YouCam S2S task payload JSON.

### 2. Live Cloud Deployment to Perfect Corp Servers
To connect to live Perfect Corp endpoints:
1. Click the **Gear icon (Settings)** in the top navigation.
2. Enter your `YOUCAM_API_KEY` and `YOUCAM_API_SECRET` (Use free voucher code `ytmakerthrive` for 500 units).
3. The engine automatically transitions from the sandbox engine to live Server-to-Server asynchronous task dispatch with 2-second exponential backoff polling.

---

## 🛠️ Step-by-Step Local Deployment

```bash
# 1. Clone repository
git clone https://github.com/your-org/lumashift.git
cd lumashift

# 2. Install dependencies
npm install

# 3. Create .env.local (Optional)
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000`.

---

## 🚢 1-Click Vercel Deployment

Deploy directly to Vercel with zero server maintenance:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Environment Variables to add in Vercel project settings:
- `YOUCAM_API_KEY` *(optional)*
- `YOUCAM_API_SECRET` *(optional)*
- `YOUCAM_ENDPOINT` *(default: `https://yce.makeupar.com`)*

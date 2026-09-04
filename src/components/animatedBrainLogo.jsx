import { motion } from "framer-motion";

/**
 * AnimatedBrainLogo
 * Cabeça + folhas traçadas a partir da logo original (LogoPessegoPrincipal.png),
 * agora como paths SVG independentes para poder animar cada parte de verdade.
 *
 * Sequência: cabeça aparece -> caule cresce -> folha pequena brota ->
 * folhas de cima brotam -> balanço suave contínuo.
 *
 * Prop `size`: largura em px (altura calculada automaticamente, proporção 2:3).
 */
export default function AnimatedBrainLogo({ size = 220, className = "" }) {
  const height = size * 1.5;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="105 65 250 375"
        width={size}
        height={height}
        className="overflow-visible"
      >
        {/* =====================================================
            CABEÇA (com a abertura no topo)
        ====================================================== */}
        <motion.path
          d="M 206 244 C 194.2 243 185 240 178 238 C 171 236 167.5 234.2 164 232 C 160.5 229.8 158.2 226.7 157 225 C 155.8 223.3 156.3 223.3 157 222 C 157.7 220.7 158.5 218.8 161 217 C 163.5 215.2 166.7 213 172 211 C 177.3 209 189.7 207.5 193 205 C 196.3 202.5 196.5 196.3 192 196 C 187.5 195.7 171.8 201 166 203 C 160.2 205 159.8 205.7 157 208 C 154.2 210.3 150.8 212.3 149 217 C 147.2 221.7 146.3 230.2 146 236 C 145.7 241.8 150.3 242.8 147 252 C 143.7 261.2 129.5 283.2 126 291 C 122.5 298.8 125.3 296.7 126 299 C 126.7 301.3 127.2 302.7 130 305 C 132.8 307.3 141.5 309.3 143 313 C 144.5 316.7 139 323.5 139 327 C 139 330.5 142.3 330.8 143 334 C 143.7 337.2 142.2 343.2 143 346 C 143.8 348.8 147.2 347.7 148 351 C 148.8 354.3 147.5 362.3 148 366 C 148.5 369.7 149 370.8 151 373 C 153 375.2 154.3 377.5 160 379 C 165.7 380.5 179.3 380.7 185 382 C 190.7 383.3 191.3 384.2 194 387 C 196.7 389.8 199.8 393.3 201 399 C 202.2 404.7 200.7 417 201 421 C 201.3 425 185.2 422.7 203 423 C 220.8 423.3 290.2 436.7 308 423 C 325.8 409.3 309 356 310 341 C 311 326 312 335.8 314 333 C 316 330.2 319 328.7 322 324 C 325 319.3 329.2 312.3 332 305 C 334.8 297.7 337.7 290 339 280 C 340.3 270 340.7 255.3 340 245 C 339.3 234.7 337.5 224.3 335 218 C 332.5 211.7 328.8 209.8 325 207 C 321.2 204.2 317 202.8 312 201 C 307 199.2 302.3 197.5 295 196 C 287.7 194.5 272.2 190.8 268 192 C 263.8 193.2 267.3 201 270 203 C 272.7 205 277.5 202.8 284 204 C 290.5 205.2 303 208.2 309 210 C 315 211.8 317 213 320 215 C 323 217 325.8 220.3 327 222 C 328.2 223.7 328.5 223.2 327 225 C 325.5 226.8 322.2 230.7 318 233 C 313.8 235.3 308.8 237.2 302 239 C 295.2 240.8 285.5 242.8 277 244 C 268.5 245.2 255.7 246 251 246 C 246.3 246 256.5 244.3 249 244 C 241.5 243.7 217.8 245 206 244 Z"
          fill="#ff9b7d"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {/* Grupo do caule + folhas: recebe o balanço suave depois que tudo brota */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 1.6, 0, -1.6, 0] }}
          transition={{
            delay: 2.9,
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "223px 243px" }}
        >
          {/* =====================================================
              CAULE PRINCIPAL
          ====================================================== */}
          <motion.path
            d="M 223 243 C 222 220 222 195 224 178"
            fill="none"
            stroke="#ff9b7d"
            strokeWidth="9"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.55, duration: 0.75, ease: "easeOut" }}
          />

          {/* Ramo -> folha pequena (a primeira a brotar) */}
          <motion.path
            d="M 222 213 C 228 217 236 222 241 226"
            fill="none"
            stroke="#ff9b7d"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.05, duration: 0.4, ease: "easeOut" }}
          />

          {/* Ramo -> folha de cima */}
          <motion.path
            d="M 224 178 C 228 168 234 157 238 149"
            fill="none"
            stroke="#ff9b7d"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.3, duration: 0.45, ease: "easeOut" }}
          />

          {/* Ramo -> folha da direita */}
          <motion.path
            d="M 224 178 C 235 178 247 177 256 175"
            fill="none"
            stroke="#ff9b7d"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.45, duration: 0.45, ease: "easeOut" }}
          />

          {/* =====================================================
              FOLHA PEQUENA (a primeira a abrir)
          ====================================================== */}
          <motion.g
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            animate={{ opacity: 1, scale: [0, 1.15, 1], rotate: [-20, 5, 0] }}
            transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "241px 226px" }}
          >
            <path
              d="M 244 217 C 243.3 210.7 238 202.8 235 198 C 232 193.2 229.7 190.8 226 188 C 222.3 185.2 216.3 182.3 213 181 C 209.7 179.7 207.5 179.2 206 180 C 204.5 180.8 204.3 182.7 204 186 C 203.7 189.3 203.7 196.2 204 200 C 204.3 203.8 204.7 205.5 206 209 C 207.3 212.5 209.3 217.5 212 221 C 214.7 224.5 217.5 227.5 222 230 C 226.5 232.5 235.3 238.2 239 236 C 242.7 233.8 244.7 223.3 244 217 Z"
              fill="#ff9b7d"
            />
          </motion.g>

          {/* =====================================================
              FOLHA DA DIREITA
          ====================================================== */}
          <motion.g
            initial={{ opacity: 0, scale: 0, rotate: 25 }}
            animate={{ opacity: 1, scale: [0, 1.15, 1], rotate: [25, -6, 0] }}
            transition={{ delay: 1.85, duration: 0.65, ease: "easeOut" }}
            style={{ transformOrigin: "256px 175px" }}
          >
            <path
              d="M 254 185 C 257 191.8 267.3 180 272 177 C 276.7 174 279.5 170.3 282 167 C 284.5 163.7 285.7 160.8 287 157 C 288.3 153.2 290.3 151.3 290 144 C 289.7 136.7 289.3 116 285 113 C 280.7 110 269.2 122.2 264 126 C 258.8 129.8 255.7 126.2 254 136 C 252.3 145.8 251 178.2 254 185 Z"
              fill="#ff9b7d"
            />
          </motion.g>

          {/* =====================================================
              FOLHA DE CIMA (a maior, a última a abrir)
          ====================================================== */}
          <motion.g
            initial={{ opacity: 0, scale: 0, rotate: -25 }}
            animate={{ opacity: 1, scale: [0, 1.18, 1], rotate: [-25, 6, 0] }}
            transition={{ delay: 2.15, duration: 0.7, ease: "easeOut" }}
            style={{ transformOrigin: "238px 149px" }}
          >
            <path
              d="M 240 150 C 241.2 151.3 243 157 243 156 C 243 155 240.3 150 240 144 C 239.7 138 242 127.3 241 120 C 240 112.7 236.3 104.8 234 100 C 231.7 95.2 229.8 93.7 227 91 C 224.2 88.3 221 86 217 84 C 213 82 206.5 79.8 203 79 C 199.5 78.2 197.7 77.8 196 79 C 194.3 80.2 193.7 82.3 193 86 C 192.3 89.7 191.3 95 192 101 C 192.7 107 195.2 117 197 122 C 198.8 127 200.7 128.3 203 131 C 205.3 133.7 205.5 135.2 211 138 C 216.5 140.8 231.2 146 236 148 C 240.8 150 238.8 148.7 240 150 Z"
              fill="#ff9b7d"
            />
          </motion.g>
        </motion.g>
      </motion.svg>

      {/* =====================================================
          GLOW (respiração suave atrás do desenho)
      ====================================================== */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb9a1]/25 blur-[55px]"
        animate={{
          opacity: [0.3, 0.55, 0.3],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          delay: 2.9,
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
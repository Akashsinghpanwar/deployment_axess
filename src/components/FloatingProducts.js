import React, { useEffect, useState, useRef } from 'react';
import './FloatingProducts.css';

const FloatingProducts = ({ isDarkMode }) => {
  const [products, setProducts] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const productsRef = useRef([]);

  useEffect(() => {
    console.log('FloatingProducts component mounted');
    
    // ✅ सही फाइल नाम (exact filenames from images directory)
    const productImages = [
      'product1.jpeg',
      'product2.jpeg',
      'product3.jpeg',
      'product5.jpeg',
      'product6.jpeg',
      'product7.jpeg',
      'product9.png',
      'product14.jpeg'
    ];

    console.log('Product images array:', productImages);

    const createProducts = () => {
      return productImages.map((image, index) => {
        const size = Math.random() * 100 + 80;
        const baseX = Math.random() * (window.innerWidth - 200) + 100;
        return {
          id: index,
          image,
          // 👇 स्टार्ट: स्क्रीन के नीचे
          x: baseX,
          baseX,
          y: window.innerHeight + Math.random() * 200,
          // 👇 px/sec में स्पीड रख रहे हैं (स्मूद और कंट्रोल्ड)
          speedY: Math.random() * 60 + 40, // 40–100 px/sec ऊपर की ओर (smoother)
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 1.5, // deg/sec (धीमा)
          size,
          baseOpacity: Math.random() * 0.7 + 0.5, // Higher opacity for visibility
          opacity: 1,
          // 👇 gentle side-to-side
          floatAmplitude: Math.random() * 15 + 10,
          floatSpeed: Math.random() * 0.6 + 0.3, // rad/sec (slower for smoother movement)
          floatPhase: Math.random() * Math.PI * 2,
          glowIntensity: Math.random() * 0.2 + 0.1, // More glow
          fading: false,
          fadeT: 0 // 0→1
        };
      });
    };

    const initialProducts = createProducts();
    setProducts(initialProducts);
    productsRef.current = initialProducts;
    console.log('Created products:', initialProducts.length);

    const animate = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = Math.min((t - lastTimeRef.current) / 1000, 0.016); // Cap at 16ms for smooth 60fps
      lastTimeRef.current = t;

      // Update products directly in ref to avoid state update lag
      const updatedProducts = productsRef.current.map(p => {
        // phase/rotation update
        const floatPhase = p.floatPhase + p.floatSpeed * dt;
        const rotation = p.rotation + p.rotationSpeed * dt;

        // x = baseX + sin(phase)*amp  ✅ differential नहीं, absolute offset
        const x = p.baseX + Math.sin(floatPhase) * p.floatAmplitude;

        // y ऊपर की ओर घट रहा है ✅
        let y = p.y - p.speedY * dt;

        // टॉप से ऊपर गया? fade शुरू
        let fading = p.fading;
        let fadeT = p.fadeT;
        if (y < -200 && !fading) {
          fading = true;
          fadeT = 0;
        }

        // fade प्रोग्रेस
        let opacity = p.baseOpacity;
        if (fading) {
          fadeT = Math.min(1, fadeT + dt * 0.4); // ~2.5s में fade (smoother)
          opacity = p.baseOpacity * (1 - fadeT);
        }

        // fade पूरा? फिर से नीचे से जन्म
        if (fading && fadeT >= 1) {
          const size = Math.random() * 100 + 80;
          const baseX = Math.random() * (window.innerWidth - 200) + 100;
          return {
            ...p,
            x: baseX,
            baseX,
            y: window.innerHeight + Math.random() * 200,
            speedY: Math.random() * 60 + 40, // Smoother speed
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 1.5,
            size,
            baseOpacity: Math.random() * 0.7 + 0.5, // Higher opacity
            opacity: 1,
            floatAmplitude: Math.random() * 15 + 10,
            floatSpeed: Math.random() * 0.6 + 0.3, // Slower for smoother movement
            floatPhase: Math.random() * Math.PI * 2,
            glowIntensity: Math.random() * 0.2 + 0.1, // More glow
            fading: false,
            fadeT: 0
          };
        }

        return {
          ...p,
          x,
          y,
          rotation,
          floatPhase,
          opacity,
          fading,
          fadeT
        };
      });

      // Update ref and state less frequently for smoother animation
      productsRef.current = updatedProducts;
      setProducts(updatedProducts);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // resize पर baseX रिसेट करो ताकि bounds सही रहें
    const onResize = () => {
      const resizedProducts = productsRef.current.map(p => {
        const baseX = Math.min(
          Math.max(p.baseX, 100),
          window.innerWidth - 100
        );
        return { ...p, baseX };
      });
      productsRef.current = resizedProducts;
      setProducts(resizedProducts);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', onResize);
      lastTimeRef.current = 0;
    };
  }, [isDarkMode]);

  // img error fallback: data-URI placeholder (क्योंकि img में textContent नहीं दिखेगा)
  const handleImgError = (e, idx) => {
    console.log('Image failed to load:', e.target.src);
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
        <rect width='100%' height='100%' fill='transparent'/>
        <text x='50%' y='50%' font-size='18' font-family='sans-serif' text-anchor='middle' fill='${isDarkMode ? '#FFFFFF' : '#000000'}'>Product ${idx + 1}</text>
      </svg>`
    );
    e.currentTarget.src = `data:image/svg+xml;charset=utf-8,${svg}`;
  };

  const handleImgLoad = (imageName) => {
    console.log('Image loaded successfully:', imageName);
  };

  return (
    <div className={`floating-products ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Glowing Moon */}
      <div className="glowing-moon">
        <div className="moon-core"></div>
        <div className="moon-glow"></div>
        <div className="moon-glow-outer"></div>
      </div>

      {products.map(p => (
        <div
          key={p.id}
          className="floating-product"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            filter: `brightness(${1 + p.glowIntensity})`,
            transition: 'none', // Remove transition for smoother animation
            zIndex: 10
          }}
        >
          <div
            className="product-glow"
            style={{
              boxShadow: isDarkMode
                ? `0 0 ${p.size * 0.15}px rgba(124,58,237,${p.glowIntensity})`
                : `0 0 ${p.size * 0.15}px rgba(255,215,0,${p.glowIntensity})`
            }}
          />
          <img
            src={`/images/${p.image}`}
            alt={`Axess Product ${p.id + 1}`}
            className="product-image"
            onLoad={() => handleImgLoad(p.image)}
            onError={(e) => handleImgError(e, p.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default FloatingProducts;


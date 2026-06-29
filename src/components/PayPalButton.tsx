import React, { useEffect, useState, useRef } from 'react';

interface PayPalButtonProps {
  hostedButtonId: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ hostedButtonId }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerId = `paypal-container-${hostedButtonId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false);

  useEffect(() => {
    const existingScript = document.getElementById('paypal-sdk-hosted-buttons');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk-hosted-buttons';
      script.src = 'https://www.paypal.com/sdk/js?client-id=BAAWVLGpygBPDZhHnMAO0idlNaNy4QHMxuQMEEkf-msQoRVZbGuPk62qgh2GO-GwmUxltLsHSyQLEcPulg&components=hosted-buttons&disable-funding=venmo&currency=USD';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && (window as any).paypal && !hasRendered.current) {
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }
      
      try {
        (window as any).paypal.HostedButtons({
          hostedButtonId: hostedButtonId,
        }).render(`#${containerId}`);
        hasRendered.current = true;
      } catch (err) {
        console.error("Error rendering PayPal button:", err);
      }
    }

    return () => {
      // Cleanup to prevent React conflicts on unmount
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      hasRendered.current = false;
    };
  }, [scriptLoaded, hostedButtonId, containerId]);

  return (
    <div key={containerId} className="w-full min-h-[50px] flex justify-center">
      <div id={containerId} ref={containerRef} className="w-full"></div>
    </div>
  );
};

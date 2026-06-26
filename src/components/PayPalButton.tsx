import React, { useEffect, useState } from 'react';

interface PayPalButtonProps {
  hostedButtonId: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({ hostedButtonId }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerId = `paypal-container-${hostedButtonId}`;

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
    if (scriptLoaded && (window as any).paypal) {
      // Clear container if it has content to prevent duplicates in strict mode
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
      
      (window as any).paypal.HostedButtons({
        hostedButtonId: hostedButtonId,
      }).render(`#${containerId}`);
    }
  }, [scriptLoaded, hostedButtonId, containerId]);

  return <div id={containerId} className="w-full min-h-[50px] flex justify-center"></div>;
};

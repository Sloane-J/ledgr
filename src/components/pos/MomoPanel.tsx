// src/components/pos/MomoPanel.tsx
import * as React from 'react';
import { Smartphone, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { formatCurrency } from '@/src/lib/constants';
import { MomoNetwork, MomoStatus } from './usePOS';
import { cn } from '@/lib/utils';

const NETWORKS: { id: MomoNetwork; name: string; color: string; textColor: string }[] = [
  { id: 'mtn',       name: 'MTN MoMo',   color: '#FFCC00', textColor: '#000000' },
  { id: 'vodafone',  name: 'Telecel',    color: '#E60000', textColor: '#FFFFFF' },
  { id: 'airteltigo',name: 'AirtelTigo', color: '#0055A4', textColor: '#FFFFFF' },
];

interface MomoPanelProps {
  total: number;
  momoNetwork: MomoNetwork;
  momoNumber: string;
  momoStatus: MomoStatus;
  isCheckingOut: boolean;
  isValidMomoNumber: (num: string) => boolean;
  onNetworkChange: (network: MomoNetwork) => void;
  onNumberChange: (number: string) => void;
  onConfirm: () => void;
}

export function MomoPanel({
  total,
  momoNetwork,
  momoNumber,
  momoStatus,
  isCheckingOut,
  isValidMomoNumber,
  onNetworkChange,
  onNumberChange,
  onConfirm,
}: MomoPanelProps) {
  const isProcessing = momoStatus !== 'idle' || isCheckingOut;
  const isNumberValid = isValidMomoNumber(momoNumber);

  const statusMessage = {
    idle: null,
    sending: 'Sending payment prompt…',
    waiting: 'Waiting for customer to approve…',
    confirmed: 'Payment confirmed. Saving order…',
  }[momoStatus];

  return (
    <div className="space-y-5">

      {/* Amount */}
      <div className="text-center py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Amount
        </p>
        <p className="text-3xl font-black tabular-nums text-primary">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Network selector */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Network
        </p>
        <div
          className="grid grid-cols-3 gap-2"
          role="radiogroup"
          aria-label="Mobile money network"
        >
          {NETWORKS.map(net => {
            const isSelected = momoNetwork === net.id;
            return (
              <button
                key={net.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => onNetworkChange(net.id)}
                disabled={isProcessing}
                className={cn(
                  'h-14 text-[10px] font-black uppercase tracking-widest border-2 transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isSelected
                    ? 'scale-[1.03] shadow-md'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                )}
                style={
                  isSelected
                    ? { backgroundColor: net.color, color: net.textColor, borderColor: net.color }
                    : {}
                }
              >
                {net.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone number input */}
      <div>
        <Label
          htmlFor="momo-number"
          className="text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          Phone Number
        </Label>
        <Input
          id="momo-number"
          type="tel"
          inputMode="numeric"
          placeholder="024 000 0000"
          value={momoNumber}
          onChange={e => onNumberChange(e.target.value)}
          disabled={isProcessing}
          aria-describedby="momo-number-hint"
          aria-invalid={momoNumber.length > 0 && !isNumberValid}
          maxLength={13}
          className={cn(
            'mt-1.5 h-12 text-center text-xl font-black font-mono tracking-widest',
            'border-border focus:border-primary',
            momoNumber.length > 0 && !isNumberValid && 'border-destructive focus:border-destructive'
          )}
        />
        <p
          id="momo-number-hint"
          className={cn(
            'text-[10px] mt-1',
            momoNumber.length > 0 && !isNumberValid
              ? 'text-destructive'
              : 'text-muted-foreground'
          )}
        >
          {momoNumber.length > 0 && !isNumberValid
            ? 'Enter a valid Ghana number starting with 024, 025, 054, 055, 059…'
            : 'Ghana mobile number (MTN, Telecel, AirtelTigo)'
          }
        </p>
      </div>

      {/* Status indicator */}
      {momoStatus !== 'idle' && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'flex items-center gap-3 px-4 py-3 border',
            momoStatus === 'confirmed'
              ? 'border-primary/30 bg-primary/5 text-primary'
              : 'border-border bg-muted text-muted-foreground'
          )}
        >
          {momoStatus === 'confirmed' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          )}
          <p className="text-xs font-semibold">{statusMessage}</p>
        </div>
      )}

      {/* Send prompt button */}
      <button
        onClick={onConfirm}
        disabled={isProcessing || !isNumberValid}
        aria-label="Send mobile money payment prompt to customer"
        className={cn(
          'w-full h-14 font-black text-sm uppercase tracking-widest transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {momoStatus === 'confirmed' ? 'Confirming…' : 'Processing…'}
          </>
        ) : (
          <>
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            Send Payment Prompt
          </>
        )}
      </button>
    </div>
  );
}

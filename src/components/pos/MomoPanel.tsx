// src/components/pos/MomoPanel.tsx
import * as React from 'react';
import { Smartphone, CheckCircle2, Loader2, UserCheck } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { formatCurrency } from '@/src/lib/constants';
import { MomoStatus } from './usePOS';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MomoPanelProps {
  total: number;
  cashReceived: string;
  changeDue: number;
  isCashEnough: boolean;
  momoStatus: MomoStatus;
  momoNumber: string;
  isCheckingOut: boolean;
  onMomoNumberChange: (number: string) => void;
  onConfirm: (type: 'prompt' | 'pay_to_account') => void;
}

export function MomoPanel({
  total,
  isCashEnough,
  momoStatus,
  momoNumber,
  isCheckingOut,
  onMomoNumberChange,
  onConfirm,
}: MomoPanelProps) {
  const isProcessing = momoStatus !== 'idle' || isCheckingOut;

  const statusMessage: Partial<Record<MomoStatus, string>> = {
    sending: 'Sending payment prompt to customer…',
    waiting: 'Waiting for customer to approve…',
    confirmed: 'Payment confirmed. Saving order…',
    pay_to_account: 'Processing payment…',
  };

  const handleSendPrompt = () => {
    if (!momoNumber.trim()) {
      toast.warning('No phone number entered. The prompt will not be sent to a customer phone.', {
        action: {
          label: 'Proceed anyway',
          onClick: () => onConfirm('prompt'),
        },
        duration: 5000,
      });
      return;
    }
    onConfirm('prompt');
  };

  return (
    <div className="flex flex-col h-full gap-5">

      {/* Icon + label */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border border-primary/20 bg-primary/5 flex items-center justify-center text-primary shrink-0">
          <Smartphone className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tight">Mobile Money</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send a prompt or confirm after payment to account.
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="border border-border bg-muted/20 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Total to collect
        </p>
        <p className="text-3xl font-black tabular-nums text-primary">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Optional phone number */}
      <div>
        <Label
          htmlFor="momo-number"
          className="text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          Customer Phone Number
          <span className="ml-2 normal-case tracking-normal text-muted-foreground/50">
            (optional)
          </span>
        </Label>
        <Input
          id="momo-number"
          type="tel"
          inputMode="numeric"
          placeholder="024 000 0000"
          value={momoNumber}
          onChange={e => onMomoNumberChange(e.target.value)}
          disabled={isProcessing}
          maxLength={13}
          className="mt-1.5 h-10 bg-background border-border font-mono tracking-widest"
          aria-describedby="momo-number-hint"
        />
        <p
          id="momo-number-hint"
          className="text-[10px] text-muted-foreground mt-1"
        >
          Required only for Send Prompt. Pay to Account works without it.
        </p>
      </div>

      {/* Status */}
      {momoStatus !== 'idle' && statusMessage[momoStatus] && (
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
          <p className="text-xs font-semibold">{statusMessage[momoStatus]}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-auto space-y-3">
        <button
          onClick={handleSendPrompt}
          disabled={isProcessing || !isCashEnough}
          aria-label="Send mobile money prompt to customer phone"
          className={cn(
            'w-full h-14 font-black text-sm uppercase tracking-widest transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isProcessing && momoStatus !== 'pay_to_account' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {momoStatus === 'confirmed' ? 'Confirming…' : 'Processing…'}
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Send Prompt
            </>
          )}
        </button>

        <button
          onClick={() => onConfirm('pay_to_account')}
          disabled={isProcessing || !isCashEnough}
          aria-label="Customer already paid to agent account"
          className={cn(
            'w-full h-14 font-black text-sm uppercase tracking-widest transition-colors',
            'border-2 border-border hover:border-primary hover:text-primary hover:bg-primary/5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isProcessing && momoStatus === 'pay_to_account' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processing…
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              Pay to Account
            </>
          )}
        </button>

        <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
          Confirm only after payment is received
        </p>
      </div>
    </div>
  );
}

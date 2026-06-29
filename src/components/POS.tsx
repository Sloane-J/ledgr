// src/components/POS.tsx
import * as React from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePOS } from './pos/usePOS';
import { ProductGrid } from './pos/ProductGrid';
import { OrderPanel } from './pos/OrderPanel';
import { PaymentOverlay } from './pos/PaymentOverlay';
import { HeldOrdersDrawer } from './pos/HeldOrdersDrawer';
import { SuccessDialog } from './pos/SuccessDialog';
import { ReceiptPrint } from './ReceiptPrint';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function POS() {
  const pos = usePOS();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ── Payment overlay — rendered outside normal flow ── */}
      {pos.isPaymentOpen && (
        <PaymentOverlay
          total={pos.total}
          paymentMethod={pos.paymentMethod}
          cashReceived={pos.cashReceived}
          changeDue={pos.changeDue}
          isCashEnough={pos.isCashEnough}
          isCheckingOut={pos.isCheckingOut}
          quickCashAmounts={pos.quickCashAmounts}
          momoNetwork={pos.momoNetwork}
          momoNumber={pos.momoNumber}
          momoStatus={pos.momoStatus}
          isValidMomoNumber={pos.isValidMomoNumber}
          cashInputRef={pos.cashInputRef}
          onClose={() => pos.setIsPaymentOpen(false)}
          onPaymentMethodChange={pos.setPaymentMethod}
          onNumpadInput={pos.handleNumpadInput}
          onMomoNetworkChange={pos.setMomoNetwork}
          onMomoNumberChange={pos.setMomoNumber}
          onCashConfirm={pos.handleCheckout}
          onCardConfirm={pos.handleCheckout}
          onMomoConfirm={pos.handleMomoCheckout}
        />
      )}

      {/* ── Mobile tab bar ── */}
      <div
        className="lg:hidden flex border-b border-border bg-card sticky top-0 z-10"
        role="tablist"
        aria-label="POS view"
      >
        {(['products', 'cart'] as const).map(v => (
          <button
            key={v}
            role="tab"
            aria-selected={pos.mobileView === v}
            onClick={() => pos.setMobileView(v)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3',
              'text-xs font-bold uppercase tracking-widest transition-colors relative',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              pos.mobileView === v
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            )}
          >
            {v === 'products'
              ? <Package className="h-4 w-4" aria-hidden="true" />
              : <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            }
            {v === 'products' ? 'Products' : 'Cart'}
            {v === 'cart' && pos.totalItems > 0 && (
              <span
                className="absolute top-2 right-6 bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center"
                aria-label={`${pos.totalItems} items in cart`}
              >
                {pos.totalItems}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Product grid ── */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 overflow-hidden',
        pos.mobileView === 'cart' ? 'hidden lg:flex' : 'flex'
      )}>
        <ProductGrid
          products={pos.filteredProducts}
          categories={pos.categories}
          cart={pos.cart}
          loading={pos.loading}
          search={pos.search}
          activeCategory={pos.activeCategory}
          searchInputRef={pos.searchInputRef}
          onSearch={pos.setSearch}
          onCategoryChange={pos.setActiveCategory}
          onAddToCart={product => {
            pos.addToCart(product);
            if (window.innerWidth < 1024 && pos.cart.length === 0) {
              pos.setMobileView('cart');
            }
          }}
        />
      </div>

      {/* ── Order panel ── */}
      <div className={cn(
        pos.mobileView === 'products' ? 'hidden lg:flex' : 'flex'
      )}>
        <OrderPanel
          cart={pos.cart}
          totalItems={pos.totalItems}
          subtotal={pos.subtotal}
          discount={pos.discount}
          discountAmount={pos.discountAmount}
          tax={pos.tax}
          total={pos.total}
          customerName={pos.customerName}
          selectedCustomerId={pos.selectedCustomerId}
          customers={pos.customers}
          onCustomerChange={(name, id) => {
            pos.setCustomerName(name);
            pos.setSelectedCustomerId(id);
          }}
          orderNote={pos.orderNote}
          onOrderNoteChange={pos.setOrderNote}
          onDiscountChange={pos.setDiscount}
          onRemove={pos.removeFromCart}
          onUpdateQuantity={pos.updateQuantity}
          onDirectChange={pos.setItemQuantityDirect}
          onQuantityBlur={pos.handleQuantityBlur}
          heldOrdersCount={pos.heldOrders.length}
          onOpenHeldOrders={() => {
            pos.fetchHeldOrders();
            pos.setIsHoldListOpen(true);
          }}
          onClearCart={() => pos.setIsClearConfirmOpen(true)}
          onHoldOrder={() => pos.setIsHoldDialogOpen(true)}
          onPay={() => pos.setIsPaymentOpen(true)}
          isCheckingOut={pos.isCheckingOut}
        />
      </div>

      {/* ── Clear cart confirmation ── */}
      {pos.isClearConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => pos.setIsClearConfirmOpen(false)}
            aria-hidden="true"
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            aria-describedby="clear-desc"
            className="relative bg-card border border-border w-[90vw] max-w-sm p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
              <p id="clear-title" className="font-black text-base uppercase tracking-tight">
                Clear Cart?
              </p>
            </div>
            <p id="clear-desc" className="text-sm text-muted-foreground">
              This will remove all {pos.totalItems} item{pos.totalItems !== 1 ? 's' : ''} from
              the cart. This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => pos.setIsClearConfirmOpen(false)}
                autoFocus
                className={cn(
                  'flex-1 h-10 border border-border text-sm font-bold uppercase tracking-widest',
                  'hover:bg-muted transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => { pos.clearCart(); pos.setIsClearConfirmOpen(false); }}
                className={cn(
                  'flex-1 h-10 bg-destructive text-white text-sm font-bold uppercase tracking-widest',
                  'hover:bg-destructive/90 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive'
                )}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hold order dialog ── */}
      <Dialog open={pos.isHoldDialogOpen} onOpenChange={pos.setIsHoldDialogOpen}>
        <DialogContent className="w-[90vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black">Hold Order</DialogTitle>
            <DialogDescription>
              Add a label to identify this order when you resume it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div>
              <Label
                htmlFor="hold-customer"
                className="text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Customer / Label
              </Label>
              <Input
                id="hold-customer"
                placeholder="e.g. Table 5, John"
                value={pos.customerName}
                onChange={e => pos.setCustomerName(e.target.value)}
                maxLength={100}
                className="mt-1 border-border"
              />
            </div>
            <div>
              <Label
                htmlFor="hold-note"
                className="text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Note
              </Label>
              <Input
                id="hold-note"
                placeholder="e.g. Extra spicy"
                value={pos.orderNote}
                onChange={e => pos.setOrderNote(e.target.value)}
                maxLength={200}
                className="mt-1 border-border"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => pos.setIsHoldDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={pos.handleHoldOrder}
            >
              Hold Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Held orders drawer ── */}
      <HeldOrdersDrawer
        open={pos.isHoldListOpen}
        heldOrders={pos.heldOrders}
        loading={pos.heldOrdersLoading}
        onClose={() => pos.setIsHoldListOpen(false)}
        onResume={pos.handleResumeOrder}
        onDelete={pos.handleDeleteHeldOrder}
      />

      {/* ── Success dialog ── */}
      <SuccessDialog
        open={pos.isSuccessOpen}
        orderId={pos.lastOrderId}
        paymentInfo={pos.lastPaymentInfo}
        onPrint={() => pos.setShouldPrint(true)}
        onClose={() => pos.setIsSuccessOpen(false)}
      />

      {/* ── Receipt print ── */}
      <ReceiptPrint
        lastOrderId={pos.lastOrderId}
        paymentInfo={pos.lastPaymentInfo}
        shouldPrint={pos.shouldPrint}
        onPrintDone={() => pos.setShouldPrint(false)}
      />
    </div>
  );
}

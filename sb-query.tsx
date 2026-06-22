// Before - userRole never passed down
<OrderTable
  orders={filteredOrders}
  onRefund={order => { setSelectedOrder(order); setIsRefundDialogOpen(true); }}
  onVoid={order => { setSelectedOrder(order); setIsVoidDialogOpen(true); }}
  onReprint={handleReprint}
/>

// After one prop, everything works
<OrderTable
  orders={filteredOrders}
  userRole={userRole}
  onRefund={order => { setSelectedOrder(order); setIsRefundDialogOpen(true); }}
  onVoid={order => { setSelectedOrder(order); setIsVoidDialogOpen(true); }}
  onReprint={handleReprint}
/>
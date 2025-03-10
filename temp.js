const data1 = [
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/data",
      "forwardUrl": "https://backend.com/process",
      "response": { "message": "Success", "data": { "id": 1, "value": "A" } },
      "statusCode": 200,
      "type": "GET",
      "comment": "Processed successfully",
      "duration": 120,
      "userId": "user-123"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/user",
      "forwardUrl": "https://backend.com/user",
      "response": { "message": "User found", "data": { "id": 42, "name": "John" } },
      "statusCode": 200,
      "type": "POST",
      "comment": null,
      "duration": 98,
      "userId": "user-456"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/auth",
      "forwardUrl": "https://auth.example.com/login",
      "response": { "message": "Unauthorized" },
      "statusCode": 401,
      "type": "POST",
      "comment": "Invalid credentials",
      "duration": 150,
      "userId": "user-789"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/orders",
      "forwardUrl": "https://orders.example.com/process",
      "response": { "message": "Order placed", "orderId": "ORD123" },
      "statusCode": 201,
      "type": "POST",
      "comment": "Order confirmed",
      "duration": 210,
      "userId": "user-101"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/products",
      "forwardUrl": "https://inventory.example.com/list",
      "response": { "message": "Product list retrieved", "count": 50 },
      "statusCode": 200,
      "type": "GET",
      "comment": null,
      "duration": 75,
      "userId": "user-202"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/payment",
      "forwardUrl": "https://payments.example.com/charge",
      "response": { "message": "Payment declined", "error": "Insufficient funds" },
      "statusCode": 402,
      "type": "POST",
      "comment": "Payment failure",
      "duration": 180,
      "userId": "user-303"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/stats",
      "forwardUrl": "https://analytics.example.com/data",
      "response": { "message": "Stats generated", "views": 1023 },
      "statusCode": 200,
      "type": "GET",
      "comment": null,
      "duration": 65,
      "userId": "user-404"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/settings",
      "forwardUrl": "https://backend.example.com/config",
      "response": { "message": "Settings updated" },
      "statusCode": 200,
      "type": "PATCH",
      "comment": "Updated user preferences",
      "duration": 110,
      "userId": "user-505"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/support",
      "forwardUrl": "https://support.example.com/ticket",
      "response": { "message": "Ticket created", "ticketId": "TKT789" },
      "statusCode": 201,
      "type": "POST",
      "comment": "User reported an issue",
      "duration": 95,
      "userId": "user-606"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/logout",
      "forwardUrl": "https://auth.example.com/logout",
      "response": { "message": "Logged out" },
      "statusCode": 200,
      "type": "POST",
      "comment": null,
      "duration": 50,
      "userId": "user-707"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/profile",
      "forwardUrl": "https://backend.com/user/profile",
      "response": { "message": "Profile updated" },
      "statusCode": 200,
      "type": "PUT",
      "comment": "User changed profile details",
      "duration": 130,
      "userId": "user-111"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/cart",
      "forwardUrl": "https://backend.com/cart",
      "response": { "message": "Item added to cart", "itemId": 54 },
      "statusCode": 201,
      "type": "POST",
      "comment": null,
      "duration": 90,
      "userId": "user-222"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/reports",
      "forwardUrl": "https://analytics.example.com/reports",
      "response": { "message": "Report generated", "reportId": "RPT456" },
      "statusCode": 200,
      "type": "GET",
      "comment": "Monthly sales report",
      "duration": 180,
      "userId": "user-333"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/notifications",
      "forwardUrl": "https://backend.com/notifications",
      "response": { "message": "Notifications retrieved", "count": 12 },
      "statusCode": 200,
      "type": "GET",
      "comment": null,
      "duration": 85,
      "userId": "user-444"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/feedback",
      "forwardUrl": "https://backend.com/feedback",
      "response": { "message": "Feedback submitted" },
      "statusCode": 201,
      "type": "POST",
      "comment": "User provided feedback",
      "duration": 140,
      "userId": "user-555"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/wishlist",
      "forwardUrl": "https://backend.com/wishlist",
      "response": { "message": "Item removed from wishlist", "itemId": 29 },
      "statusCode": 200,
      "type": "DELETE",
      "comment": null,
      "duration": 110,
      "userId": "user-666"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/comments",
      "forwardUrl": "https://backend.com/comments",
      "response": { "message": "Comment added", "commentId": "CMT789" },
      "statusCode": 201,
      "type": "POST",
      "comment": "User commented on a post",
      "duration": 100,
      "userId": "user-777"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/subscriptions",
      "forwardUrl": "https://payments.example.com/subscriptions",
      "response": { "message": "Subscription renewed" },
      "statusCode": 200,
      "type": "POST",
      "comment": "Auto-renewal processed",
      "duration": 190,
      "userId": "user-888"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/messages",
      "forwardUrl": "https://backend.com/messages",
      "response": { "message": "New messages retrieved", "count": 5 },
      "statusCode": 200,
      "type": "GET",
      "comment": null,
      "duration": 70,
      "userId": "user-999"
  },
  {
      "requestId": "no-request-id",
      "requestUrl": "https://example.com/api/deals",
      "forwardUrl": "https://backend.com/deals",
      "response": { "message": "Deals list updated" },
      "statusCode": 200,
      "type": "PATCH",
      "comment": "Daily deals refreshed",
      "duration": 95,
      "userId": "user-1010"
  }
]

const arr = ["cm806h6cp0002umforap3xz96", "cm806h9280004umfotb6nun9a", "cm80d4cni0001um2873k5xsia"];

const add = async (data) => {
  try {
      data.requestId = arr[Math.floor(Math.random() * arr.length)];
      data = JSON.parse(JSON.stringify(data))
      console.log(data)
      const res = await PrismaClient.requestLog.create({
          data
      })
      console.log(res)
  } catch (error) {
      console.log(error)
  }
}

for (let i = 1; i < data1.length; i++) {
  add(data1[0])
}
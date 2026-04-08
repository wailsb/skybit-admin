# Skybit Public API Documentation

This document provides details for front-end developers on how to consume the public data from the Skybit Backoffice API. All public routes are CORS-enabled (`Access-Control-Allow-Origin: *`) and return JSON.

## Base URL
`https://[your-domain]/api/public`

---

## 1. Services
Fetch the list of all services offered by Skybit.

### **Endpoint**
`GET /services`

### **Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f1...",
      "title": "Web Development",
      "description": "High-performance web apps...",
      "imageUrl": "https://res.cloudinary.com/..."
    }
  ]
}
```

---

## 2. Clients
Fetch the list of partner clients and their project metrics.

### **Endpoint**
`GET /clients`

### **Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f2...",
      "name": "Jane Doe",
      "company": "TechCorp",
      "email": "jane@techcorp.com",
      "phone": "+123456789",
      "imageUrl": "https://res.cloudinary.com/...",
      "projectCount": 5
    }
  ]
}
```

---

## 3. Team
Fetch the list of team members and their profiles.

### **Endpoint**
`GET /team`

### **Response (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": "65f3...",
      "name": "Alex Smith",
      "role": "Lead Architect",
      "email": "alex@skybit.com",
      "bio": "Expert in cloud systems...",
      "imageUrl": "https://res.cloudinary.com/...",
      "socials": {
        "linkedin": "...",
        "github": "..."
      }
    }
  ]
}
```

---

## Edge Case & Error Handling

### **Errors**
In case of a failure, the API returns a non-200 status code with an error object:
```json
{
  "success": false,
  "message": "Failed to fetch [resource]"
}
```

### **Common Status Codes**
- `200 OK`: Request successful.
- `404 Not Found`: The requested endpoint does not exist.
- `500 Internal Server Error`: Database connection failure or runtime error.

### **Handling Strategies for Frontend Devs**
1. **Loading States**: Always show a skeleton or loader while `success` is pending.
2. **Empty Data**: If `data` is an empty array `[]`, display an appropriate "No records found" UI.
3. **CORS**: These routes are configured for cross-origin requests. Ensure your client correctly handles pre-flight `OPTIONS` requests.
4. **Image Fallbacks**: If `imageUrl` is empty, use a local placeholder image to avoid broken UI components.

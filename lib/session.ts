import { cookies } from "next/headers";
import { verifyRefreshToken } from "./jwt";
import { Database } from "@/config/db";
import { Filter, ObjectId } from "mongodb";

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("refresh_token")?.value;

    if (!token) return null;

    const payload = await verifyRefreshToken(token);
    if (!payload || !payload.userId) return null;

    const db = Database.getInstance().getClient();
    await db.connect();
    const collection = db.db('skybit').collection('users');
    
    // Using a record to satisfy MongoDB's Filter without using 'any' or shadowing the global 'Document' interface
    const query = {
      _id: typeof payload.userId === 'string' && payload.userId.length === 24 
        ? new ObjectId(payload.userId) 
        : payload.userId 
    } as unknown as Filter<Record<string, unknown>>;

    const user = await collection.findOne(query);

    if (!user) return null;

    return {
      name: user.name || "Administrator",
      email: user.email,
      avatar: user.avatar || "",
      role: user.role,
    };
  } catch (err) {
    if (err instanceof Error && (err as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.error("Session fetch error:", err);
    return null;
  }
}

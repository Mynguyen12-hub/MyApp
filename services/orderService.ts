import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export async function createOrder({
  paymentMethod,
  totalAmount,
  items,
}: {
  paymentMethod: "momo" | "bank" | "cod";
  totalAmount: number;
  items: any[];
}) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  const order = {
    userId: user.uid,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    totalAmount,
    items,
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "orders"), order);
}

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRouter } from "next/router";

export default function Home() {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "Punjab9thNotes"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items);
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Learn with Taleem Spot 📚</h1>
      <p style={{ color: "gray", marginBottom: 20 }}>
        Download our app for better experience and more features.
      </p>
      {data.map((item) => (
        <div
          key={item.id}
          onClick={() => router.push(`/note/${encodeURIComponent(item.id)}`)}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 20,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <h3>{item.id}</h3>
          <p style={{ color: "gray" }}>Click to view more</p>
        </div>
      ))}
    </div>
  );
}

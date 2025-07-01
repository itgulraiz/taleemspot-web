import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "Punjab9thNotes"));
      const items = [];
      querySnapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setData(items);
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Learn with Taleem Spot 📚</h1>
      <p style={{ color: 'gray', marginBottom: 20 }}>Download our app for better experience and more features.</p>
      {data.map(item => (
        <div key={item.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20, borderRadius: 8 }}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <iframe
            src={item.url}
            width="100%"
            height="400px"
            style={{ border: "none", borderRadius: 8 }}
          ></iframe>
          <a href={item.url} download>
            <button style={{ marginTop: 10 }}>Download PDF</button>
          </a>
        </div>
      ))}
    </div>
  );
}

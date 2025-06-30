import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const docRef = doc(db, "Punjab9thNotes", "Taleem Spot");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const englishNotes = docSnap.data().English?.Chapters?.["Hazrat Muhammad S.A.W"];
        setData(englishNotes);
      } else {
        console.error("No such document!");
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Learn with Taleem Spot 📚</h1>
      <p style={{ color: 'gray', marginBottom: 20 }}>Download our app for better experience and more features.</p>

      {data ? (
        <>
          <h3>Long Questions</h3>
          <iframe src={data["Long Questions"]} width="100%" height="400px" style={{ border: "none", borderRadius: 8 }}></iframe>
          <a href={data["Long Questions"]} target="_blank" rel="noopener noreferrer" download>
            <button style={{ marginTop: 10 }}>Download PDF</button>
          </a>

          <h3>MCQs</h3>
          <iframe src={data["MCQ's"]} width="100%" height="400px" style={{ border: "none", borderRadius: 8 }}></iframe>
          <a href={data["MCQ's"]} target="_blank" rel="noopener noreferrer" download>
            <button style={{ marginTop: 10 }}>Download PDF</button>
          </a>

          <h3>Short Questions</h3>
          <iframe src={data["Short Questions's"]} width="100%" height="400px" style={{ border: "none", borderRadius: 8 }}></iframe>
          <a href={data["Short Questions's"]} target="_blank" rel="noopener noreferrer" download>
            <button style={{ marginTop: 10 }}>Download PDF</button>
          </a>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

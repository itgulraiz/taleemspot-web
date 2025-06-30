import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function NotePage() {
  const router = useRouter();
  const { id } = router.query;

  const [note, setNote] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchNote() {
      const ref = doc(db, 'Punjab9thNotes', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setNote(snap.data());
      }
    }

    fetchNote();
  }, [id]);

  if (!note) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{id}</h1>
      <p style={{ fontWeight: 'bold' }}>{note?.Details}</p>
      <p>Author: {note?.Author}</p>

      <iframe
        src={note?.Chapters?.['Mr. Chips']?.['18 Chapters Notes'].replace("/view?usp=drive_link", "/preview")}
        width="100%"
        height="480px"
        style={{ border: "none", borderRadius: 10 }}
      />

      <a
        href={note?.Chapters?.['Mr. Chips']?.['18 Chapters Notes']}
        download
        target="_blank"
        rel="noopener noreferrer"
      >
        <button style={{ marginTop: 20 }}>Download PDF</button>
      </a>
    </div>
  );
}

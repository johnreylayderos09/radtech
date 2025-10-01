
export default function DialogBox({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 999
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "400px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 0 15px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc",
    marginBottom: 10
  },
  closeBtn: {
    fontSize: 20,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#444"
  },
  body: {
    paddingTop: 10
  }
}

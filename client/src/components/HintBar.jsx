export default function HintBar({ hint, word, isDrawer }) {
  // drawer sees the actual word
  // others see the hint like _ _ a _ _
  const display = isDrawer ? word : hint;

  if (!display) return null;

  return (
    <div style={styles.wrapper}>
      {display.split("").map((char, i) => {
        if (char === " ") {
          return <div key={i} style={styles.space} />;
        }
        if (char === "_") {
          return <div key={i} style={styles.blank} />;
        }
        return (
          <div key={i} style={styles.letter}>
            {char}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  // revealed letter
  letter: {
    width: 22,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    borderBottom: "3px solid #4ecca3",
  },
  // unrevealed letter
  blank: {
    width: 22,
    height: 32,
    borderBottom: "3px solid #aaa",
  },
  // space between words
  space: {
    width: 14,
  },
};
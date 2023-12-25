export function NoIntenet({ isOnline }) {
  return (
    <div>
      {typeof window !== "undefined" && !isOnline ? (
        <div suppressHydrationWarning>
          Please check your internet connection and try again.
        </div>
      ) : null}
    </div>
  );
}

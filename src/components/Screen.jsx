export function Screen({ variant, image }) {
  if (image) {
    return (
      <div className="screen screen-image-wrapper">
        <img src={image} alt="App preview" className="screen-image" />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="bar v" style={{ height: 10, width: '55%' }} />
      {variant === 'feed' && (
        <>
          <div className="block" style={{ height: '38%' }} />
          <div className="bar" style={{ height: 8, width: '80%' }} />
          <div className="bar" style={{ height: 8, width: '45%' }} />
          <div className="block" style={{ height: '24%' }} />
          <div className="bar" style={{ height: 8, width: '65%' }} />
        </>
      )}
      {variant === 'player' && (
        <>
          <div className="block" style={{ height: '44%', borderRadius: 16 }} />
          <div className="bar v" style={{ height: 4, width: '100%' }} />
          <div className="bar" style={{ height: 8, width: '70%' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
            <div className="bar v" style={{ height: 26, width: 26, borderRadius: 999 }} />
            <div className="bar" style={{ height: 26, width: 26, borderRadius: 999 }} />
          </div>
        </>
      )}
      {variant === 'list' && (
        <>
          {[0, 1, 2, 3].map((n) => (
            <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="block" style={{ width: 34, height: 34, borderRadius: 8 }} />
              <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                <div className="bar" style={{ height: 7, width: `${80 - n * 12}%` }} />
                <div className="bar" style={{ height: 7, width: '40%' }} />
              </div>
            </div>
          ))}
          <div className="bar v" style={{ height: 26, marginTop: 'auto' }} />
        </>
      )}
    </div>
  );
}

import { Screen } from './Screen';

export function Phone({ variant, className = '', image }) {
  return (
    <div className={`phone ${className}`.trim()}>
      <span className="notch" />
      <Screen variant={variant} image={image} />
    </div>
  );
}

// Approved C05 masters; outlined lettering preserves the identity without font loading.
export default function BrandLogo({ reverse = false, icon = false, width = 216, className = '', style }) {
  return <img
    src={`/brand/c05/${icon ? 'icons/icon-primary.svg' : `logos/logo-horizontal-${reverse ? 'reverse' : 'primary'}.svg`}`}
    alt="HomeReady Scores"
    width={width}
    height={icon ? width : width * 110 / 360}
    className={className}
    style={{ display: 'block', width, height: 'auto', maxWidth: '100%', flexShrink: 0, ...style }}
  />;
}

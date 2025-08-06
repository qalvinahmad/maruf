/*
	Installed from https://reactbits.dev/tailwind/
*/

export default function GradientText({
  children,
  className = "",
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  showBorder = false,
}) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  // Extract font-weight from className if exists, otherwise use font-medium as default
  const hasFontWeight = className.includes('font-');
  const baseClasses = `relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-[1.25rem] backdrop-blur transition-shadow duration-500 overflow-hidden cursor-pointer`;
  const fontWeightClass = hasFontWeight ? '' : 'font-medium';
  const finalClassName = `${baseClasses} ${fontWeightClass} ${className}`;

  return (
    <div className={finalClassName}
    >
      {showBorder && (
        <div
          className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient-horizontal"
          style={{
            ...gradientStyle,
            backgroundSize: "300% 100%",
          }}
        >
          <div
            className="absolute inset-0 bg-black rounded-[1.25rem] z-[-1]"
            style={{
              width: "calc(100% - 2px)",
              height: "calc(100% - 2px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        </div>
      )}
      <div
        className="inline-block relative z-2 text-transparent bg-cover animate-gradient-horizontal"
        style={{
          ...gradientStyle,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          backgroundSize: "300% 100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

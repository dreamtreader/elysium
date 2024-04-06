import React from "react";

type Props = {
  children: React.ReactNode;
  text: string;
  placement?: string;
  className?: string;
  containerClassName?: string;
};

const placements: { [index: string]: string } = {
  left: "top-[50%] translate-y-[-50%] right-[109%]",
  right: "top-[50%] translate-y-[-50%] left-[109%]",
  up: "left-[50%] translate-x-[-50%] bottom-[109%]",
  down: "left-[50%] translate-x-[-50%] top-[109%]",
};

const placementsArrow: { [index: string]: string } = {
  left: "top-[50%] translate-y-[-50%] right-[-4%]",
  right: "top-[50%] translate-y-[-50%] left-[-4%]",
  up: "left-[50%] translate-x-[-50%] bottom-[-9%]",
  down: "left-[50%] translate-x-[-50%] top-[-9%] ",
};
const Tooltip = ({
  children,
  text,
  placement = "up",
  className = "",
  containerClassName = "",
}: Props) => {
  return (
    <div className={`relative ${containerClassName}`}>
      <div className="tooltip-container">{children}</div>

      <main
        className={`z-10 transition-opacity ease-in duration-100 absolute ${placements[placement]} bg-csblue-600 p-2 text-cspink-50 whitespace-nowrap rounded-md ${className} tooltip`}
      >
        <span className="z-10">{text}</span>
        <div
          className={`absolute ${placementsArrow[placement]} rounded-[0.1rem] z-10 h-2 w-2 rotate-45 bg-inherit`}
        >
          &nbsp;
        </div>
      </main>
    </div>
  );
};
export default Tooltip;

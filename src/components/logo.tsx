import Image from "next/image";

export function Logo() {
  return (
    <span className="logo">
      <Image
        className="logo__mark"
        src="/icon.svg"
        width={28}
        height={28}
        alt=""
        unoptimized
        priority
        draggable={false}
      />
      <span className="logo__word">minelog</span>
    </span>
  );
}


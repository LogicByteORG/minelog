import Image from "next/image";

export function Logo() {
  return (
    <span className="logo">
      <Image
        className="logo__mark logo__mark--light"
        src="/icon-black.svg"
        width={28}
        height={28}
        alt=""
        unoptimized
        priority
        draggable={false}
      />
      <Image
        className="logo__mark logo__mark--dark"
        src="/icon-white.svg"
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


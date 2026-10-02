import Image from "next/image";

export function Logo() {
  return (
    <span className="logo">
      <span className="logo__marks" aria-hidden="true">
        <Image
          className="logo__mark logo__mark--light"
          src="/brand/minelog-black.svg"
          width={28}
          height={28}
          alt=""
          unoptimized
          priority
          draggable={false}
        />
        <Image
          className="logo__mark logo__mark--dark"
          src="/brand/minelog-white.svg"
          width={28}
          height={28}
          alt=""
          unoptimized
          priority
          draggable={false}
        />
      </span>
      <span className="logo__word">minelog</span>
    </span>
  );
}


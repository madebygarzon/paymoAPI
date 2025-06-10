interface LoaderProps {
  size?: number; // tamaño opcional en píxeles
}

export default function Loader({ size = 80 }: LoaderProps) {
  const innerSize = size * 0.8;

  return (
    <div className="flex-col gap-4 w-full flex items-center justify-center">
      <div
        className="border-4 border-transparent text-blue-400 animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
        style={{ width: size, height: size }}
      >
        <div
          className="border-4 border-transparent text-red-400 animate-spin flex items-center justify-center border-t-red-400 rounded-full"
          style={{ width: innerSize, height: innerSize }}
        />
      </div>
    </div>
  );
}

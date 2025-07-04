// 'use client';

// import { useState } from 'react';

// interface VariantSelectorProps {
//   variants: string[];
//   onSelect: (variant: string) => void;
// }
// export default function VariantSelector({
//   variants,
//   onSelect,
// }: VariantSelectorProps) {
//   const [selected, setSelected] = useState<string | null>(null);
//   function handleSelect(variant: string) {
//     setSelected(variant);
//     onSelect(variant);
//   }
//   return (
//     <div className="h-[50px]">
//       <ul className="flex gap-4">
//         {variants.map((item, index) => (
//           <li
//             onClick={() => handleSelect(item)}
//             key={index}
//             className={`cursor-pointer border min-w-[67px] px-2 py-1 rounded-md flex items-center justify-centertext-sm transition-all ${
//               selected === item
//                 ? 'border-black font-semibold bg-white'
//                 : 'border-gray-300 bg-gray-100'
//             }`}
//           >
//             {item}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

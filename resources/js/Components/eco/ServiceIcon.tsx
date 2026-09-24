import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faBroom,
    faHouse,
    faLeaf,
    faPeopleGroup,
    faRecycle,
    faShieldHalved,
    faSprayCanSparkles,
    faWater,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Ikon layanan dipilih otomatis dari nama layanan (data dari database),
 * sehingga layanan baru buatan admin tetap mendapat ikon yang cocok.
 */
const rules: [RegExp, IconDefinition][] = [
    [/rumah|hunian|apartemen|kamar/i, faHouse],
    [/rumput|taman|tanam|kebun|pohon/i, faLeaf],
    [/sampah|limbah|daur/i, faRecycle],
    [/selokan|got|saluran|air|kolam/i, faWater],
    [/\brt\b|\brw\b|lingkungan|kerja bakti|umum/i, faPeopleGroup],
    [/sanitasi|desinfeksi|steril/i, faShieldHalved],
    [/karpet|sofa|cuci/i, faSprayCanSparkles],
];

export function serviceIcon(name: string): IconDefinition {
    return rules.find(([re]) => re.test(name))?.[1] ?? faBroom;
}

export default function ServiceIcon({ name, className = '' }: { name: string; className?: string }) {
    return <FontAwesomeIcon icon={serviceIcon(name)} className={className} />;
}

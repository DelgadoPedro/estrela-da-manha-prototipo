import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icone } from './Icone';
import type { NomeIcone } from './icones';

interface Props {
  tipo?: 'principal' | 'secundario' | 'perigo' | 'perigo-cheio' | 'discreto';
  icone?: NomeIcone;
  iconeDir?: NomeIcone;
  para?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  largo?: boolean;
  submit?: boolean;
  rotulo?: string;
}
export function Botao({ tipo = 'principal', icone, iconeDir, para, onClick, disabled, className = '', children, largo, submit, rotulo }: Props) {
  const cls = `botao botao-${tipo}${largo ? ' botao-largo' : ''} ${className}`;
  const dentro = <>{icone && <Icone nome={icone} />}<span>{children}</span>{iconeDir && <Icone nome={iconeDir} />}</>;
  if (para && !disabled) return <Link className={cls} to={para} aria-label={rotulo}>{dentro}</Link>;
  return <button className={cls} type={submit ? 'submit' : 'button'} onClick={onClick} disabled={disabled} aria-label={rotulo}>{dentro}</button>;
}

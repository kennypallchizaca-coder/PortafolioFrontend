import { FiEdit2, FiGithub, FiInstagram, FiTrash2 } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { ProgrammerProfile } from '../../services/programmers'

interface ProgrammerListProps {
    programmers: ProgrammerProfile[]
    onEdit: (dev: ProgrammerProfile) => void
    onDelete: (uid: string, displayName: string) => void
}

export const ProgrammerList = ({ programmers, onEdit, onDelete }: ProgrammerListProps) => {
    return (
        <div className="card bg-base-100 shadow-md">
            <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="card-title">Listado</h2>
                    <span className="badge badge-secondary">{programmers.length}</span>
                </div>
                <div className="space-y-2">
                    {programmers.map((dev) => (
                        <div key={dev.id} className="flex flex-col rounded-lg border border-base-200 p-3">
                            <div className="flex items-start gap-3">
                                <div className="avatar">
                                    <div className="w-12 rounded-full">
                                        {dev.photoURL ? (
                                            <img src={dev.photoURL} alt={dev.displayName} />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-base-300">
                                                <span className="text-lg">👤</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{dev.displayName}</p>
                                        <span className="badge badge-outline capitalize">
                                            {dev.specialty || 'Especialidad'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-base-content/60">{dev.email}</p>
                                    <p className="text-sm text-base-content/70">{dev.bio}</p>

                                    {dev.socials && (
                                        <div className="flex gap-2 mt-2">
                                            {dev.socials.github && (
                                                <a href={dev.socials.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-focus">
                                                    <FiGithub />
                                                </a>
                                            )}
                                            {dev.socials.instagram && (
                                                <a href={dev.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary-focus">
                                                    <FiInstagram />
                                                </a>
                                            )}
                                            {dev.socials.whatsapp && (
                                                <a href={dev.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="text-success hover:text-success-focus">
                                                    <FaWhatsapp />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {dev.skills && dev.skills.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                                {dev.skills.map((skill, idx) => (
                                                    <span key={idx} className="badge badge-primary badge-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={() => onEdit(dev)}
                                            className="btn btn-sm btn-primary gap-2"
                                        >
                                            <FiEdit2 className="h-4 w-4" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete(dev.id!, dev.displayName)}
                                            className="btn btn-sm btn-error gap-2"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!programmers.length && (
                        <div className="alert alert-info text-sm">
                            Aún no hay programadores. Crea uno con el formulario.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

import type { User } from '@/lib/auth';

const configuredAdmins=(process.env.ADMIN_EMAILS||'hummedicals@gmail.com').split(',').map(email=>email.trim().toLowerCase()).filter(Boolean);

export function isAdmin(user:Pick<User,'email'>|null|undefined){return Boolean(user&&configuredAdmins.includes(user.email.toLowerCase()));}
export function adminEmails(){return configuredAdmins;}

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, MoreHorizontal, Pencil, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AvatarInitials from "@/components/avatar-initials";
import FormInputField from "@/components/form-input-field";
import PrimaryButton from "@/components/primary-button";
import type { User, UserRole } from "@/lib/institutional-data";
import { useInviteUser, useUpdateUserRole, useUsers } from "@/hooks/use-lista-data";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { data: users = [], isLoading, isError, error } = useUsers();
  const inviteMutation = useInviteUser();
  const updateRoleMutation = useUpdateUserRole();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "trainee" });
  const [editForm, setEditForm] = useState({ role: "trainee" });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) {
      toast({ title: "Validation Error", description: "Name and email are required.", variant: "destructive" });
      return;
    }

    try {
      await inviteMutation.mutateAsync({
        name: inviteForm.name,
        email: inviteForm.email,
        role: inviteForm.role as UserRole,
      });
      setIsInviteOpen(false);
      setInviteForm({ name: "", email: "", role: "trainee" });
      toast({
        title: "User Added",
        description: `${inviteForm.email} saved to InsForge.`,
      });
    } catch (err) {
      toast({
        title: "Could not add user",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ role: user.role });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateRoleMutation.mutateAsync({
        userId: editingUser.id,
        role: editForm.role as UserRole,
      });
      setIsEditOpen(false);
      toast({
        title: "User Updated",
        description: `Role updated for ${editingUser.name}`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-primary hover:bg-primary">Admin</Badge>;
      case "staff":
        return (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
            Staff
          </Badge>
        );
      case "trainee":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">
            Trainee
          </Badge>
        );
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const formatJoined = (createdAt?: string) => {
    if (!createdAt) return "—";
    try {
      return format(new Date(createdAt), "MMM d, yyyy");
    } catch {
      return "—";
    }
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage system access and roles (InsForge).</p>
        </motion.div>

        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <PrimaryButton className="gap-2">
              <Plus className="h-4 w-4" />
              Invite User
            </PrimaryButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>Add a user record in InsForge (link auth separately if needed).</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormInputField
                  label="Full Name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                />
                <FormInputField
                  label="Email Address"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  required
                />
                <motion.div variants={itemVariants} className="grid gap-1.5">
                  <label className="text-sm font-semibold tracking-tight">Role</label>
                  <Select value={inviteForm.role} onValueChange={(val) => setInviteForm({ ...inviteForm, role: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trainee">Trainee</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <PrimaryButton type="submit" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? "Saving…" : "Save User"}
                </PrimaryButton>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant={roleFilter === "all" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setRoleFilter("all")}>
            All Roles
          </Button>
          <Button variant={roleFilter === "admin" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setRoleFilter("admin")}>
            Admins
          </Button>
          <Button variant={roleFilter === "staff" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setRoleFilter("staff")}>
            Staff
          </Button>
          <Button variant={roleFilter === "trainee" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setRoleFilter("trainee")}>
            Trainees
          </Button>
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-white border-card-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading users from InsForge…
            </div>
          ) : isError ? (
            <motion.div variants={itemVariants} className="p-8 text-center text-destructive text-sm">
              {error instanceof Error ? error.message : "Failed to load users"}
            </motion.div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold text-muted-foreground">User</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Role</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Joined</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarInitials name={user.name} size="sm" />
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatJoined(user.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(user)} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </motion.div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>Change permissions for {editingUser?.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold tracking-tight">Role</label>
                <Select value={editForm.role} onValueChange={(val) => setEditForm({ role: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainee">Trainee</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <PrimaryButton type="submit" disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? "Saving…" : "Save Changes"}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

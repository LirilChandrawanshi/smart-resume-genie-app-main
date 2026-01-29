import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminApi, AdminResumeResponse, AdminUserResponse, Resume } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import ResumePreview from '@/components/ResumePreview';
import { Loader2, Trash2, Eye, Download } from 'lucide-react';

const PAGE_SIZE = 10;

const AdminResumes: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [data, setData] = useState<{ content: AdminResumeResponse[]; totalElements: number; totalPages: number; number: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewResume, setViewResume] = useState<Resume | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminApi.getUsers({ page: 0, size: 200 }).then((res) => setUsers(res.content)).catch(() => {});
  }, []);

  const loadResumes = useCallback(() => {
    setLoading(true);
    adminApi
      .getResumes({ userId: filterUserId || undefined, page, size: PAGE_SIZE })
      .then((res) => setData({ content: res.content, totalElements: res.totalElements, totalPages: res.totalPages, number: res.number }))
      .catch((err) => setError(err.message || 'Failed to load resumes'))
      .finally(() => setLoading(false));
  }, [page, filterUserId]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteResume(deleteId);
      toast({ title: 'Resume deleted', description: 'The resume has been deleted.' });
      setDeleteId(null);
      loadResumes();
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleView = async (id: string) => {
    setViewLoading(true);
    setViewResume(null);
    try {
      const resume = await adminApi.getResumeById(id);
      setViewResume(resume);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setViewLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminApi.exportResumesCsv(filterUserId || undefined);
      toast({ title: 'Export started', description: 'resumes.csv download started.' });
    } catch (err: unknown) {
      toast({ title: 'Export failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (error) {
    return (
      <div className="text-destructive py-4">
        {error}
      </div>
    );
  }

  const resumes = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.number ?? 0;

  const resumeDataForPreview = viewResume
    ? {
        personalInfo: viewResume.personalInfo ?? { name: '', title: '', email: '', phone: '', location: '', summary: '' },
        experience: viewResume.experience ?? [],
        education: viewResume.education ?? [],
        skills: viewResume.skills ?? [],
        projects: viewResume.projects ?? [],
        achievements: viewResume.achievements ?? [],
      }
    : null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Resumes</h2>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All resumes</CardTitle>
              <CardDescription>Saved resumes with owner and template</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by user:</span>
              <Select
                value={filterUserId ?? 'all'}
                onValueChange={(v) => {
                  setFilterUserId(v === 'all' ? null : v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="ml-1">Export CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumes.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name || 'Untitled'}</TableCell>
                      <TableCell>{r.ownerUsername}</TableCell>
                      <TableCell>{r.template || 'default'}</TableCell>
                      <TableCell>{formatDate(r.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(r.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {resumes.length === 0 && (
                <p className="text-muted-foreground text-center py-6">No resumes found.</p>
              )}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 0) setPage(currentPage - 1);
                        }}
                        className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(i);
                          }}
                          isActive={currentPage === i}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages - 1) setPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete resume</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this resume. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewResume || viewLoading} onOpenChange={(open) => !open && setViewResume(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>View resume</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : resumeDataForPreview && viewResume ? (
            <ScrollArea className="h-[70vh] pr-4">
              <ResumePreview resumeData={resumeDataForPreview} selectedTemplate={viewResume.template || 'default'} />
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResumes;

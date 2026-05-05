import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/motion/Reveal";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { api, type ApiSubject, type ApiTeacherSubject, type ApiUploadPublic } from "@/lib/api";

const SUBJECT_GRADIENTS: Record<string, string> = {
  Physics: "from-violet-600 via-fuchsia-600 to-pink-500",
  Chemistry: "from-blue-700 via-blue-600 to-indigo-500",
  Biology: "from-emerald-600 via-teal-600 to-cyan-500",
};

const SUBJECTS: ApiSubject[] = ["Physics", "Chemistry", "Biology"];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

// ── Upload form ───────────────────────────────────────────────────────────────
function UploadForm({
  subject,
  onUploaded,
}: {
  subject: ApiSubject;
  onUploaded: (item: ApiUploadPublic) => void;
}) {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<"video" | "pdf">("video");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    if (!title.trim()) { setError("Please enter a title."); return; }

    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("file_type", fileType);
      form.append("subject", subject);
      form.append("file", file);

      const result = await api.teacher.uploadResource(form);
      onUploaded(result);
      setTitle("");
      setFile(null);
      setSuccess(true);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-ink-700 ">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Newton's Laws — Full Lecture"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-extrabold text-ink-700 ">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(["video", "pdf"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFileType(t)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition focus-ring ${
                fileType === t
                  ? "border-brand-400 bg-brand-50 text-brand-400 shadow-card"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              {t === "video" ? "Video" : "PDF Notes"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-extrabold text-ink-700 ">
          File {fileType === "video" ? "(MP4, WebM, or YouTube link as .txt)" : "(PDF)"}
        </label>
        <div
          className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-brand-500/40 hover:bg-slate-100 cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-brand-500" />
          <div className="text-sm font-semibold text-slate-500">
            {file ? file.name : "Click to select file"}
          </div>
          {file && (
            <div className="text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept={fileType === "pdf" ? ".pdf" : "video/*,.mp4,.webm,.mov"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Uploaded successfully! Students can now see this resource.
        </div>
      )}

      <Button type="submit" className="w-full h-11 rounded-2xl" disabled={loading}>
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
        ) : (
          <><Upload className="h-4 w-4" /> Upload Resource</>
        )}
      </Button>
    </form>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function TeacherMySubjectScreen() {
  const [subjectInfo, setSubjectInfo] = useState<ApiTeacherSubject | null>(null);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [resources, setResources] = useState<ApiUploadPublic[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ApiSubject>("Physics");
  const [assignError, setAssignError] = useState<string | null>(null);

  const [showUploadForm, setShowUploadForm] = useState(false);

  // Load subject assignment
  useEffect(() => {
    setSubjectLoading(true);
    api.teacher.mySubject()
      .then((s) => setSubjectInfo(s))
      .catch((err: any) => {
        // 404 = no subject assigned yet (normal state)
        if (err?.status === 404) {
          setSubjectInfo(null);
        } else {
          setSubjectError(err?.message ?? "Failed to load");
        }
      })
      .finally(() => setSubjectLoading(false));
  }, []);

  // Load resources when subject is known
  useEffect(() => {
    if (!subjectInfo) return;
    setResourcesLoading(true);
    api.teacher.listResources({ subject: subjectInfo.subject as ApiSubject, limit: 50 })
      .then((page) => setResources(page.items ?? []))
      .catch(() => setResources([]))
      .finally(() => setResourcesLoading(false));
  }, [subjectInfo?.subject]);

  async function handleSelfAssign() {
    setAssignError(null);
    setAssigning(true);
    try {
      const result = await api.teacher.selfAssignSubject({ subject: selectedSubject });
      setSubjectInfo(result);
      // Redirect to dashboard after subject assignment
      window.location.href = "/teacher";
    } catch (err: any) {
      setAssignError(err?.message ?? "Failed to assign subject.");
    } finally {
      setAssigning(false);
    }
  }

  const gradient = subjectInfo ? (SUBJECT_GRADIENTS[subjectInfo.subject] ?? "from-byjus-700 to-byjus-500") : "";

  return (
    <div className="space-y-5">
      {/* Subject card */}
      <Reveal>
        {subjectLoading ? (
          <Card className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </Card>
        ) : subjectError ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-400 mb-3" />
            <div className="text-base font-extrabold text-slate-800">Failed to load subject</div>
            <div className="mt-1 text-sm text-slate-500">{subjectError}</div>
            <Button variant="secondary" className="mt-4 h-10 rounded-2xl" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        ) : subjectInfo ? (
          <Card className="overflow-hidden">
            <div className={`bg-gradient-to-r ${gradient} p-6`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/20 grid place-items-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white/70 uppercase tracking-wide">Your Subject</div>
                  <div className="text-2xl font-extrabold text-white">{subjectInfo.subject}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-white/70">
                Assigned since {formatDate(subjectInfo.created_at)}
              </div>
            </div>
            <div className="p-5">
              <div className="text-sm font-semibold text-slate-500 ">
                You are responsible for all {subjectInfo.subject} content. Upload notes and videos below — students will see them in their Recorded Classes page.
              </div>
            </div>
          </Card>
        ) : (
          /* No subject assigned — show self-assign form */
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-base font-extrabold text-slate-800">
                  No subject assigned yet
                </div>
                <div className="mt-1 text-sm text-slate-500 ">
                  Choose your subject below. You can only set this once — contact an admin to change it later.
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSubject(s)}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-extrabold transition focus-ring ${
                      selectedSubject === s
                        ? "border-brand-400 bg-brand-50 text-brand-400 shadow-card"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    {s}
                  </button>
                ))}
              </div>

              {assignError && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                  {assignError}
                </div>
              )}

              <Button className="w-full h-11 rounded-2xl" onClick={handleSelfAssign} disabled={assigning}>
                {assigning ? <><Loader2 className="h-4 w-4 animate-spin" /> Assigning...</> : `Assign ${selectedSubject} to me`}
              </Button>
            </div>
          </Card>
        )}
      </Reveal>

      {/* Upload section — only shown when subject is assigned */}
      {subjectInfo && (
        <>
          <Reveal delay={0.05}>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-slate-800">
                    Upload Resources
                  </div>
                  <div className="text-sm text-slate-500 ">
                    Add notes (PDF) or video links for {subjectInfo.subject} students
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="h-10 rounded-2xl shrink-0"
                  onClick={() => setShowUploadForm((v) => !v)}
                >
                  <Plus className="h-4 w-4" />
                  {showUploadForm ? "Cancel" : "New Upload"}
                </Button>
              </div>

              {showUploadForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 overflow-hidden"
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <UploadForm
                      subject={subjectInfo.subject as ApiSubject}
                      onUploaded={(item) => {
                        setResources((prev) => [item, ...prev]);
                        setShowUploadForm(false);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </Card>
          </Reveal>

          {/* Resources list */}
          <Reveal delay={0.1}>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="text-base font-extrabold text-slate-800">
                  Your Uploads
                </div>
                <Badge className="bg-slate-100 border-slate-200 text-slate-400">
                  {resources.length} resource{resources.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {resourcesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                </div>
              ) : resources.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                  <div className="text-sm font-semibold text-slate-500 ">
                    No uploads yet. Add your first resource above.
                  </div>
                </div>
              ) : (
                <motion.div
                  className="space-y-2"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {resources.map((r) => (
                    <motion.div
                      key={r.id}
                      variants={staggerItem}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-soft"
                    >
                      <div className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center ${
                        r.file_type === "video" ? "bg-brand-100" : "bg-amber-500/20"
                      }`}>
                        {r.file_type === "video"
                          ? <Video className="h-4 w-4 text-brand-500" />
                          : <FileText className="h-4 w-4 text-amber-400" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-extrabold text-slate-800">
                          {r.title}
                        </div>
                        <div className="text-xs text-slate-500 ">
                          {r.file_type.toUpperCase()} · {formatDate(r.created_at)}
                        </div>
                      </div>
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-800 transition focus-ring"
                        title="Open"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </Card>
          </Reveal>
        </>
      )}
    </div>
  );
}


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { joinServer } from "../api/join-server-api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

type FormValues = z.infer<typeof schema>;

interface JoinServerDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JoinServerDialog({
  open,
  setOpen,
}: JoinServerDialogProps) {
  

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: joinServer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["servers"],
      });

      reset();
      setOpen(false);
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Server</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Invite Code</Label>
            <Input
              placeholder="Paste invite code"
              {...register("inviteCode")}
            />

            {errors.inviteCode && (
              <p className="mt-1 text-xs text-red-400">
                {errors.inviteCode.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-sm bg-cyan-400 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              {mutation.isPending ? "Joining..." : "Join Server"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
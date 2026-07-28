import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { editChannel } from "../api/edit-channel";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(3, "Channel name must be at least 3 characters."),
  type: z.enum(["TEXT", "VOICE"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  serverId: string;
  channelId: string;
  channelName: string;
  channelType: "TEXT" | "VOICE";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditChannelDialog({
  serverId,
  channelId,
  channelName,
  channelType,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: channelName,
      type: channelType,
    },
  });

  useEffect(() => {
    if (open) {
      reset({ name: channelName, type: channelType });
    }
  }, [open, channelName, channelType, reset]);

  const selectedType = watch("type");

  const mutation = useMutation({
    mutationFn: (data: FormValues) => editChannel(channelId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels", serverId],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Channel Name</Label>
            <Input
              placeholder="Channel Name"
              {...register("name")}
            />

            {errors.name && (
              <p className="text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Channel Type</Label>

            <RadioGroup
              value={selectedType}
              onValueChange={(value) =>
                setValue("type", value as "TEXT" | "VOICE")
              }
              className="space-y-3"
            >
              <div className={`flex items-center space-x-3 rounded-sm border p-3 transition-all ${
                selectedType === "TEXT"
                  ? "border-cyan-500/20 bg-cyan-500/[0.04]"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}>
                <RadioGroupItem value="TEXT" id="edit-text" />
                <Label
                  htmlFor="edit-text"
                  className="cursor-pointer flex flex-col text-xs normal-case tracking-normal"
                >
                  <span className="text-sm text-zinc-200">💬 Text Channel</span>
                  <span className="text-[10px] text-zinc-500 mt-1">
                    Send messages, images and files.
                  </span>
                </Label>
              </div>

              <div className={`flex items-center space-x-3 rounded-sm border p-3 transition-all ${
                selectedType === "VOICE"
                  ? "border-cyan-500/20 bg-cyan-500/[0.04]"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}>
                <RadioGroupItem value="VOICE" id="edit-voice" />
                <Label
                  htmlFor="edit-voice"
                  className="cursor-pointer flex flex-col text-xs normal-case tracking-normal"
                >
                  <span className="text-sm text-zinc-200">🎤 Voice Channel</span>
                  <span className="text-[10px] text-zinc-500 mt-1">
                    Join voice calls with members.
                  </span>
                </Label>
              </div>
            </RadioGroup>

            {errors.type && (
              <p className="text-xs text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-sm bg-cyan-400 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

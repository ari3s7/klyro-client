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

  // Sync form values when the dialog opens with new channel data
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
            <Input
              placeholder="Channel Name"
              {...register("name")}
            />

            {errors.name && (
              <p className="text-sm text-red-500">
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
              <div className="flex items-center space-x-3 rounded-lg border p-3">
                <RadioGroupItem value="TEXT" id="edit-text" />
                <Label
                  htmlFor="edit-text"
                  className="cursor-pointer flex flex-col"
                >
                  <span>💬 Text Channel</span>
                  <span className="text-xs text-muted-foreground">
                    Send messages, images and files.
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-3">
                <RadioGroupItem value="VOICE" id="edit-voice" />
                <Label
                  htmlFor="edit-voice"
                  className="cursor-pointer flex flex-col"
                >
                  <span>🎤 Voice Channel</span>
                  <span className="text-xs text-muted-foreground">
                    Join voice calls with members.
                  </span>
                </Label>
              </div>
            </RadioGroup>

            {errors.type && (
              <p className="text-sm text-red-500">
                {errors.type.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AttachmentsService } from './attachments.service';
import {
  ATTACHMENT_ENTITY_TYPES,
  AttachmentEntityType,
} from './attachment.entity';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

export const MAX_ATTACHMENT_SIZE_BYTES = 4 * 1024 * 1024;

function parseEntityType(value: string): AttachmentEntityType {
  if (!ATTACHMENT_ENTITY_TYPES.includes(value as AttachmentEntityType)) {
    throw new BadRequestException('Tipo de entidade inválido');
  }
  return value as AttachmentEntityType;
}

@ApiTags('attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post(':entityType/:entityId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_ATTACHMENT_SIZE_BYTES },
    }),
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    return this.attachmentsService.upload(
      user.orgId,
      user.id,
      parseEntityType(entityType),
      entityId,
      file,
    );
  }

  @Get(':entityType/:entityId')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.attachmentsService.findAll(
      user.orgId,
      parseEntityType(entityType),
      entityId,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.attachmentsService.remove(user.orgId, id);
  }
}

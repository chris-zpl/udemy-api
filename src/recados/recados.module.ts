import { Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { RecadosService } from './recados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recados } from './entities/recados.entity';
import { PessoasModule } from 'src/pessoas/pessoas.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recados]), PessoasModule],
  controllers: [RecadosController],
  providers: [RecadosService],
})
export class RecadosModule {}

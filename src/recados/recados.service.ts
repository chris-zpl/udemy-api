import { Injectable, NotFoundException } from '@nestjs/common';
import { Recados } from './entities/recados.entity';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recados)
    private readonly recadoRepository: Repository<Recados>,
    private readonly pessoaService: PessoasService,
  ) {}

  throwNotFoundError(): never {
    /* throw new HttpException('Recado não encontrado', HttpStatus.NOT_FOUND); */
    throw new NotFoundException('Recado não encontrado');
  }

  // Para listar todos
  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto ?? {};

    const recados = await this.recadoRepository.find({
      take: limit, // quantos registros serão exibidos por página
      skip: offset, // quantos registros devem ser pulados
      relations: ['de', 'para'],
      order: {
        id: 'desc',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    return recados;
  }

  // Para listar apenas um
  async findOne(id: number): Promise<Recados> {
    //const recado = this.recados.find((item) => item.id === id);
    const recado = await this.recadoRepository.findOne({
      where: {
        id,
      },
      relations: ['de', 'para'],
      order: {
        id: 'desc',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });

    if (!recado) {
      this.throwNotFoundError();
    }

    return recado;
  }

  // Para criar
  async create(createRecadoDto: CreateRecadoDto) {
    const { deId, paraId } = createRecadoDto;
    // Encontrar a pessoa que está criando o recado
    const de = await this.pessoaService.findOne(deId);
    if (!de) return this.throwNotFoundError();

    // Encontrar a pessoa para quem o recado está sendo enviado
    const para = await this.pessoaService.findOne(paraId);
    if (!para) return this.throwNotFoundError();

    const novoRecado = {
      texto: createRecadoDto.texto,
      de,
      para,
      lido: false,
      data: new Date(),
    };
    const recado = this.recadoRepository.create(novoRecado);
    await this.recadoRepository.save(recado);

    return {
      ...recado,
      de: {
        id: recado.de.id,
      },
      para: {
        id: recado.para.id,
      },
    };
  }

  // Para atualizar
  async update(id: number, updateRecadoDto: UpdateRecadoDto) {
    const recado = await this.findOne(id);

    recado.texto = updateRecadoDto?.texto ?? recado.texto;
    recado.lido = updateRecadoDto?.lido ?? recado.lido;

    return this.recadoRepository.save(recado);
  }

  // Para remover
  async remove(id: number) {
    const recado = await this.recadoRepository.findOneBy({ id });

    if (!recado) return this.throwNotFoundError();

    return this.recadoRepository.remove(recado);
  }
}

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('api/v1/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  getTeams() {
    return this.teamsService.getTeams();
  }

  @Get(':teamId/activity')
  @ApiOperation({ summary: 'Get team activity' })
  getActivity(@Param('teamId') teamId: string) {
    return this.teamsService.getActivity(teamId);
  }

  @Post(':teamId/invite')
  @ApiOperation({ summary: 'Invite user to team' })
  invite(@Param('teamId') teamId: string, @Body() body: { email: string }) {
    return this.teamsService.invite(teamId, body.email);
  }

  @Get(':teamId/presence')
  @ApiOperation({ summary: 'Get team presence' })
  getPresence(@Param('teamId') teamId: string) {
    return this.teamsService.getPresence(teamId);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { Chain } from '../../shared/enums/chain.enum';

@ApiTags('Addresses')
@Controller('api/v1/address')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get(':address/summary')
  @ApiOperation({ summary: 'Get address summary from indexed data' })
  @ApiQuery({ name: 'chain', enum: Chain, required: false })
  async getSummary(
    @Param('address') address: string,
    @Query('chain') chain: Chain = Chain.ETHEREUM,
  ) {
    const summary = await this.addressesService.getAddressSummary(address, chain);
    return {
      totalReceived: Number(summary.totalReceived ?? 0),
      totalSent: Number(summary.totalSent ?? 0),
      balance: Number(summary.balance ?? 0),
      transactionCount: Number(summary.txCount ?? 0),
      unit: chain,
    };
  }

  @Get(':address/transactions')
  @ApiOperation({ summary: 'Get address transactions from indexed data' })
  @ApiQuery({ name: 'chain', enum: Chain, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getTransactions(
    @Param('address') address: string,
    @Query('chain') chain: Chain = Chain.ETHEREUM,
    @Query('page') pageQuery: string = '1',
    @Query('limit') limitQuery: string = '20',
  ) {
    const page = Math.max(1, Number(pageQuery) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitQuery) || 20));
    const offset = (page - 1) * limit;
    const result = await this.addressesService.getAddressTransactions(address, chain, limit, offset);

    return {
      items: result.data.map((tx) => ({
        hash: tx.txHash,
        from: tx.fromAddress,
        to: tx.toAddress,
        amount: Number(tx.amount ?? 0),
        date: tx.timestamp?.toISOString?.() ?? new Date().toISOString(),
      })),
      page,
      limit,
      total: result.total,
    };
  }

  @Get(':address/risk')
  @ApiOperation({ summary: 'Get risk score for address' })
  @ApiQuery({ name: 'chain', enum: Chain, required: false })
  async getRisk(
    @Param('address') address: string,
    @Query('chain') chain: Chain = Chain.ETHEREUM,
  ) {
    const risk = await this.addressesService.getRiskScore(address, chain);
    return {
      score: Number(risk.score ?? 0),
      factors: (risk.factors ?? []).map((factor, index) => ({
        id: String(index + 1),
        title: factor.factor,
        severity: factor.points >= 30 ? 'High' : factor.points >= 15 ? 'Medium' : 'Low',
        description: factor.description,
      })),
    };
  }

  @Get(':address/sanctions')
  @ApiOperation({ summary: 'Get sanctions/flagged status for address' })
  @ApiQuery({ name: 'chain', enum: Chain, required: false })
  async getSanctions(
    @Param('address') address: string,
    @Query('chain') chain: Chain = Chain.ETHEREUM,
  ) {
    const flagged = await this.addressesService.checkFlagged(address, chain);
    return {
      sanctioned: Boolean(flagged?.isFlagged),
      reasons: flagged?.reasons ?? [],
    };
  }

  @Get(':address/graph')
  @ApiOperation({ summary: 'Get relationship graph for address' })
  @ApiQuery({ name: 'chain', enum: Chain, required: false })
  @ApiQuery({ name: 'depth', required: false })
  async getGraph(
    @Param('address') address: string,
    @Query('chain') chain: Chain = Chain.ETHEREUM,
    @Query('depth') depthQuery: string = '2',
  ) {
    const depth = Math.min(4, Math.max(1, Number(depthQuery) || 2));
    const graph = await this.addressesService.getGraphData(address, chain, depth);
    return {
      center: address,
      nodes: (graph.nodes ?? []).map((node) => ({
        id: node.id,
        address: node.address,
        riskScore: Number(node.riskScore ?? 0),
        flagged: Boolean(node.isFlagged),
      })),
      edges: (graph.edges ?? []).map((edge, index) => ({
        id: `${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        amount: Number(edge.amount ?? 0),
      })),
    };
  }

  @Get(':address/timeseries')
  @ApiOperation({ summary: 'Get basic address time-series from indexed transactions' })
  @ApiQuery({ name: 'chain', enum: Chain, required: false })
  @ApiQuery({ name: 'range', required: false })
  async getTimeseries(
    @Param('address') address: string,
    @Query('chain') chain: Chain = Chain.ETHEREUM,
    @Query('range') range = '30d',
  ) {
    const txs = await this.addressesService.getAddressTransactions(address, chain, 200, 0);
    const points = txs.data.map((tx) => ({
      ts: tx.timestamp?.toISOString?.() ?? new Date().toISOString(),
      txCount: 1,
      inflow: tx.toAddress.toLowerCase() === address.toLowerCase() ? Number(tx.amount ?? 0) : 0,
      outflow: tx.fromAddress.toLowerCase() === address.toLowerCase() ? Number(tx.amount ?? 0) : 0,
    }));
    return { range, points };
  }

  @Get(':address/dapps')
  @ApiOperation({ summary: 'Get dapp interactions (placeholder)' })
  async getDapps() {
    return { protocols: [], flaggedInteractions: [] };
  }

  @Get(':address/approvals')
  @ApiOperation({ summary: 'Get token approvals (placeholder)' })
  async getApprovals() {
    return { items: [] };
  }

  @Get(':address/anomalies')
  @ApiOperation({ summary: 'Get anomalies (placeholder)' })
  async getAnomalies() {
    return { items: [] };
  }

  @Get(':address/cross-chain')
  @ApiOperation({ summary: 'Get cross-chain profile (placeholder)' })
  async getCrossChain() {
    return { chains: [] };
  }

  @Get(':address/mev')
  @ApiOperation({ summary: 'Get MEV exposure (placeholder)' })
  async getMev() {
    return { events: [] };
  }
}
